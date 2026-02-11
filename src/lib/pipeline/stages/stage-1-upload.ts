import { createAdminClient } from "@/lib/supabase/admin";
import { updateAnalysisStage } from "../utils";

/**
 * Stage 1: Validate and prepare uploaded documents.
 *
 * Documents are already uploaded to Supabase Storage via the upload API.
 * This stage validates that all documents are accessible and updates their status.
 */
export async function executeStage1(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 1, "uploading");

  // Get all documents linked to this analysis
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("analysis_id", analysisId);

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  if (!documents || documents.length === 0) {
    throw new Error("No documents found for this analysis");
  }

  // Validate each document exists in storage
  let totalSize = 0;
  for (const doc of documents) {
    const { data: fileData } = await supabase.storage
      .from("uploads")
      .createSignedUrl(doc.storage_path, 60);

    if (!fileData?.signedUrl) {
      throw new Error(`File not found in storage: ${doc.file_name}`);
    }

    totalSize += doc.file_size;

    // Update document status to uploading (ready for extraction)
    await supabase
      .from("documents")
      .update({ status: "uploading" })
      .eq("id", doc.id);
  }

  // Update total pages estimate (rough: ~3KB per page for PDFs)
  const estimatedPages = Math.max(1, Math.round(totalSize / 3000));
  await supabase
    .from("analyses")
    .update({ total_pages: estimatedPages })
    .eq("id", analysisId);
}
