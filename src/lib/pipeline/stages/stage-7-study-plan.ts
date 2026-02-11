import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON, selectModel } from "@/lib/gemini/client";
import { buildStudyPlanPrompt } from "@/lib/gemini/prompts/study-plan";
import { studyPlanSchema } from "@/lib/gemini/schemas/study-plan-schema";
import { trackTokenUsage } from "@/lib/utils/cost-tracker";
import { updateAnalysisStage, withRetry } from "../utils";
import type { StudyPlanDay } from "@/types";

/**
 * Stage 7: Generate a 7-day study plan using Gemini Pro.
 */
export async function executeStage7(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 7, "generating");

  const { data: analysis } = await supabase
    .from("analyses")
    .select("result_priorities, result_concepts, result_exam_problems")
    .eq("id", analysisId)
    .single();

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const prioritiesText = analysis.result_priorities
    ? JSON.stringify(analysis.result_priorities, null, 2)
    : "Keine Priorisierung";

  const conceptsText = analysis.result_concepts
    ? JSON.stringify(
        (analysis.result_concepts as Array<{ name: string; importance: number }>)
          .slice(0, 15)
          .map((c) => ({ name: c.name, importance: c.importance })),
        null,
        2
      )
    : "Keine Konzepte";

  // Summarize problems (just titles and topics to save tokens)
  const problemsSummary = analysis.result_exam_problems
    ? JSON.stringify(
        (analysis.result_exam_problems as Array<{ title: string; topic: string; type: string }>).map(
          (p) => ({ title: p.title, topic: p.topic, type: p.type })
        ),
        null,
        2
      )
    : "Keine Aufgaben";

  const prompt = buildStudyPlanPrompt(
    prioritiesText,
    conceptsText,
    problemsSummary
  );

  const result = await withRetry(
    () =>
      generateJSON<{ days: StudyPlanDay[] }>(prompt, {
        model: selectModel("study-plan"),
        systemInstruction:
          "Du bist ein erfahrener Lerncoach. Erstelle einen strukturierten 7-Tage-Lernplan. Antworte in JSON.",
        responseSchema: studyPlanSchema,
        maxOutputTokens: 8192,
      }),
    { maxRetries: 2 }
  );

  await trackTokenUsage(analysisId, {
    model: selectModel("study-plan"),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  await supabase
    .from("analyses")
    .update({ result_study_plan: result.data.days })
    .eq("id", analysisId);
}
