import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON, selectModel } from "@/lib/gemini/client";
import { buildTopicPrioritizationPrompt } from "@/lib/gemini/prompts/topic-prioritization";
import { prioritiesSchema } from "@/lib/gemini/schemas/priorities-schema";
import { trackTokenUsage } from "@/lib/utils/cost-tracker";
import { updateAnalysisStage, withRetry } from "../utils";
import type { Priority } from "@/types";

/**
 * Stage 5: Prioritize topics by exam relevance using Gemini Pro.
 */
export async function executeStage5(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 5, "analyzing");

  // Get concepts and patterns from previous stages
  const { data: analysis } = await supabase
    .from("analyses")
    .select("result_concepts, result_task_patterns")
    .eq("id", analysisId)
    .single();

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const conceptsText = analysis.result_concepts
    ? JSON.stringify(analysis.result_concepts, null, 2)
    : "Keine Konzepte gefunden";

  const patternsText = analysis.result_task_patterns
    ? JSON.stringify(analysis.result_task_patterns, null, 2)
    : "Keine Aufgabenmuster gefunden";

  // Get document type breakdown
  const { data: docs } = await supabase
    .from("documents")
    .select("doc_type, file_name")
    .eq("analysis_id", analysisId);

  const docTypeBreakdown = docs
    ? docs.map((d) => `- ${d.file_name}: ${d.doc_type}`).join("\n")
    : "Keine Dokumentinformationen";

  const prompt = buildTopicPrioritizationPrompt(
    conceptsText,
    patternsText,
    docTypeBreakdown
  );

  const result = await withRetry(
    () =>
      generateJSON<{ priorities: Priority[] }>(prompt, {
        model: selectModel("topic-prioritization"),
        systemInstruction:
          "Du bist ein erfahrener Tutor und hilfst bei der Prüfungsvorbereitung. Antworte in strukturiertem JSON.",
        responseSchema: prioritiesSchema,
        maxOutputTokens: 4096,
      }),
    { maxRetries: 2 }
  );

  await trackTokenUsage(analysisId, {
    model: selectModel("topic-prioritization"),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  await supabase
    .from("analyses")
    .update({ result_priorities: result.data.priorities })
    .eq("id", analysisId);
}
