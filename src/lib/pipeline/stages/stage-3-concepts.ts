import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON, selectModel } from "@/lib/gemini/client";
import { buildConceptExtractionPrompt } from "@/lib/gemini/prompts/concept-extraction";
import { conceptExtractionSchema } from "@/lib/gemini/schemas/concept-schema";
import { trackTokenUsage } from "@/lib/utils/cost-tracker";
import { updateAnalysisStage, withRetry } from "../utils";
import type { Concept } from "@/types";

/**
 * Stage 3: Extract concepts from the chunked text using Gemini Pro.
 */
export async function executeStage3(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 3, "analyzing");

  // Get all chunks for this analysis
  const { data: chunks, error: chunksError } = await supabase
    .from("chunks")
    .select("content, category")
    .eq("analysis_id", analysisId)
    .order("chunk_index", { ascending: true });

  if (chunksError || !chunks?.length) {
    throw new Error("No chunks found for concept extraction");
  }

  // Get document types
  const { data: docs } = await supabase
    .from("documents")
    .select("doc_type")
    .eq("analysis_id", analysisId);

  const docTypes = [...new Set(docs?.map((d) => d.doc_type as string) || [])];

  // Combine chunks into a single text (truncate if too large)
  const allText = chunks.map((c) => c.content).join("\n\n---\n\n");
  const maxTextLength = 120_000; // ~30K tokens
  const truncatedText =
    allText.length > maxTextLength
      ? allText.slice(0, maxTextLength) + "\n\n[... Text gekürzt ...]"
      : allText;

  const prompt = buildConceptExtractionPrompt(truncatedText, docTypes);

  const result = await withRetry(
    () =>
      generateJSON<{ concepts: Concept[] }>(prompt, {
        model: selectModel("concept-extraction"),
        systemInstruction:
          "Du bist ein KI-Assistent für die Analyse von Vorlesungsunterlagen. Antworte immer in strukturiertem JSON.",
        responseSchema: conceptExtractionSchema,
        maxOutputTokens: 8192,
      }),
    { maxRetries: 2 }
  );

  // Track token usage
  await trackTokenUsage(analysisId, {
    model: selectModel("concept-extraction"),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  // Store concepts in the analysis
  await supabase
    .from("analyses")
    .update({ result_concepts: result.data.concepts })
    .eq("id", analysisId);
}
