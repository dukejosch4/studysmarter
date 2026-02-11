import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON, selectModel } from "@/lib/gemini/client";
import { buildExamGenerationPrompt } from "@/lib/gemini/prompts/exam-generation";
import { examProblemsSchema } from "@/lib/gemini/schemas/exam-problems-schema";
import { trackTokenUsage } from "@/lib/utils/cost-tracker";
import { updateAnalysisStage, withRetry } from "../utils";
import type { ExamProblem } from "@/types";

/**
 * Stage 6: Generate exam problems using Gemini Pro.
 */
export async function executeStage6(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 6, "generating");

  // Get previous stage results
  const { data: analysis } = await supabase
    .from("analyses")
    .select("result_priorities, result_task_patterns")
    .eq("id", analysisId)
    .single();

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const prioritiesText = analysis.result_priorities
    ? JSON.stringify(analysis.result_priorities, null, 2)
    : "Keine Priorisierung vorhanden";

  const patternsText = analysis.result_task_patterns
    ? JSON.stringify(analysis.result_task_patterns, null, 2)
    : "Keine Aufgabenmuster vorhanden";

  // Get example problems from exercise/solution chunks
  const { data: exerciseChunks } = await supabase
    .from("chunks")
    .select("content")
    .eq("analysis_id", analysisId)
    .in("category", ["exercise", "solution"])
    .limit(10);

  const exampleText = exerciseChunks
    ? exerciseChunks.map((c) => c.content).join("\n\n---\n\n")
    : "Keine Beispielaufgaben vorhanden";

  const maxExampleLength = 30_000;
  const truncatedExamples =
    exampleText.length > maxExampleLength
      ? exampleText.slice(0, maxExampleLength) + "\n\n[... gekürzt ...]"
      : exampleText;

  const prompt = buildExamGenerationPrompt(
    prioritiesText,
    patternsText,
    truncatedExamples
  );

  const result = await withRetry(
    () =>
      generateJSON<{ problems: ExamProblem[] }>(prompt, {
        model: selectModel("exam-generation"),
        systemInstruction:
          "Du bist ein Professor im MINT-Bereich und erstellst Klausuraufgaben. Antworte in strukturiertem JSON. Nutze LaTeX ($...$) für mathematische Formeln.",
        responseSchema: examProblemsSchema,
        maxOutputTokens: 16384,
        temperature: 0.5,
      }),
    { maxRetries: 2 }
  );

  await trackTokenUsage(analysisId, {
    model: selectModel("exam-generation"),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  await supabase
    .from("analyses")
    .update({ result_exam_problems: result.data.problems })
    .eq("id", analysisId);
}
