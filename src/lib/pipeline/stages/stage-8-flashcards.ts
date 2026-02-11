import { createAdminClient } from "@/lib/supabase/admin";
import { generateJSON, selectModel } from "@/lib/gemini/client";
import { buildFlashcardGenerationPrompt } from "@/lib/gemini/prompts/flashcard-generation";
import { flashcardsSchema } from "@/lib/gemini/schemas/flashcards-schema";
import { trackTokenUsage } from "@/lib/utils/cost-tracker";
import { updateAnalysisStage, withRetry } from "../utils";
import type { Flashcard } from "@/types";

/**
 * Stage 8: Generate flashcards using Gemini Flash.
 */
export async function executeStage8(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 8, "generating");

  const { data: analysis } = await supabase
    .from("analyses")
    .select("result_concepts")
    .eq("id", analysisId)
    .single();

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  const conceptsText = analysis.result_concepts
    ? JSON.stringify(analysis.result_concepts, null, 2)
    : "Keine Konzepte";

  // Get definition and theorem chunks
  const { data: defChunks } = await supabase
    .from("chunks")
    .select("content")
    .eq("analysis_id", analysisId)
    .eq("category", "definition")
    .limit(15);

  const { data: theoremChunks } = await supabase
    .from("chunks")
    .select("content")
    .eq("analysis_id", analysisId)
    .in("category", ["theorem", "proof"])
    .limit(15);

  const definitionText = defChunks
    ? defChunks.map((c) => c.content).join("\n\n---\n\n")
    : "Keine Definitionen gefunden";

  const theoremText = theoremChunks
    ? theoremChunks.map((c) => c.content).join("\n\n---\n\n")
    : "Keine Sätze gefunden";

  const maxLength = 30_000;
  const truncatedDefs =
    definitionText.length > maxLength
      ? definitionText.slice(0, maxLength) + "\n\n[... gekürzt ...]"
      : definitionText;
  const truncatedTheorems =
    theoremText.length > maxLength
      ? theoremText.slice(0, maxLength) + "\n\n[... gekürzt ...]"
      : theoremText;

  const prompt = buildFlashcardGenerationPrompt(
    conceptsText,
    truncatedDefs,
    truncatedTheorems
  );

  const result = await withRetry(
    () =>
      generateJSON<{ flashcards: Flashcard[] }>(prompt, {
        model: selectModel("flashcard-generation"),
        systemInstruction:
          "Du erstellst Karteikarten für MINT-Studierende. Antworte in JSON. Nutze LaTeX für Formeln.",
        responseSchema: flashcardsSchema,
        maxOutputTokens: 8192,
      }),
    { maxRetries: 2 }
  );

  await trackTokenUsage(analysisId, {
    model: selectModel("flashcard-generation"),
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  await supabase
    .from("analyses")
    .update({ result_flashcards: result.data.flashcards })
    .eq("id", analysisId);
}
