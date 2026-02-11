import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON, selectModel } from "@/lib/gemini/client";
import { buildTaskPatternsPrompt } from "@/lib/gemini/prompts/task-patterns";
import { taskPatternsSchema } from "@/lib/gemini/schemas/task-patterns-schema";
import { trackTokenUsage } from "@/lib/utils/cost-tracker";
import { updateAnalysisStage, withRetry } from "../utils";
import type { TaskPattern } from "@/types";

/**
 * Stage 4: Analyze task patterns from exercise/exam chunks using Gemini Pro.
 */
export async function executeStage4(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 4, "analyzing");

  // Get exercise and solution chunks
  const { data: exerciseChunks } = await supabase
    .from("chunks")
    .select("content, category")
    .eq("analysis_id", analysisId)
    .in("category", ["exercise", "solution", "example"])
    .order("chunk_index", { ascending: true });

  // If no exercise chunks, use all chunks
  const { data: allChunks } = await supabase
    .from("chunks")
    .select("content")
    .eq("analysis_id", analysisId)
    .order("chunk_index", { ascending: true });

  const chunksToUse =
    exerciseChunks && exerciseChunks.length > 3
      ? exerciseChunks
      : allChunks || [];

  const exerciseText = chunksToUse
    .map((c) => c.content)
    .join("\n\n---\n\n");

  // Get concepts from Stage 3
  const { data: analysis } = await supabase
    .from("analyses")
    .select("result_concepts")
    .eq("id", analysisId)
    .single();

  const conceptsText = analysis?.result_concepts
    ? JSON.stringify(analysis.result_concepts, null, 2)
    : "Keine Konzepte gefunden";

  // Truncate if needed
  const maxLength = 100_000;
  const truncatedExercises =
    exerciseText.length > maxLength
      ? exerciseText.slice(0, maxLength) + "\n\n[... gekürzt ...]"
      : exerciseText;

  const prompt = buildTaskPatternsPrompt(truncatedExercises, conceptsText);

  const result = await withRetry(
    () =>
      generateJSON<{ patterns: TaskPattern[] }>(prompt, {
        model: selectModel("task-patterns"),
        systemInstruction:
          "Du bist ein KI-Assistent für die Analyse von Prüfungsaufgaben. Antworte immer in strukturiertem JSON.",
        responseSchema: taskPatternsSchema,
        maxOutputTokens: 4096,
      }),
    { maxRetries: 2 }
  );

  await trackTokenUsage(analysisId, {
    model: selectModel("task-patterns"),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  await supabase
    .from("analyses")
    .update({ result_task_patterns: result.data.patterns })
    .eq("id", analysisId);
}
