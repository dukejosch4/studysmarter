import { createAdminClient } from "@/lib/supabase/admin";
import { submitPdf, waitForCompletion, getResult } from "@/lib/mathpix/client";
import { chunkText, classifyChunk } from "@/lib/utils/chunker";
import { estimateTokens } from "@/lib/utils/tokens";
import { updateAnalysisStage, withRetry } from "../utils";

/**
 * Stage 2: Extract text from PDFs using Mathpix API, then chunk and categorize.
 *
 * For each document:
 * 1. Generate a signed URL for the PDF in Supabase Storage
 * 2. Submit to Mathpix for LaTeX-aware extraction
 * 3. Wait for completion (or use webhook for async)
 * 4. Store extracted text
 * 5. Chunk the text and store chunks with categories
 */
export async function executeStage2(
  analysisId: string,
  options: { useWebhook?: boolean } = {}
): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 2, "extracting");

  // Get documents for this analysis
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .eq("analysis_id", analysisId);

  if (error || !documents?.length) {
    throw new Error("No documents found for extraction");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const callbackUrl = options.useWebhook
    ? `${appUrl}/api/webhooks/mathpix`
    : undefined;

  let totalPages = 0;

  for (const doc of documents) {
    try {
      // Generate signed URL for Mathpix to access the PDF
      const { data: signedData } = await supabase.storage
        .from("uploads")
        .createSignedUrl(doc.storage_path, 600); // 10 min URL

      if (!signedData?.signedUrl) {
        throw new Error(`Cannot create signed URL for ${doc.file_name}`);
      }

      // Submit to Mathpix
      const submitResult = await withRetry(
        () =>
          submitPdf(
            { url: signedData.signedUrl },
            { callbackUrl }
          ),
        { maxRetries: 2 }
      );

      // Update document with Mathpix job ID
      await supabase
        .from("documents")
        .update({
          mathpix_job_id: submitResult.pdf_id,
          status: "extracting",
        })
        .eq("id", doc.id);

      if (options.useWebhook) {
        // In webhook mode, we don't wait — the webhook handler will continue
        continue;
      }

      // Poll for completion
      const status = await waitForCompletion(submitResult.pdf_id);

      if (status.status === "error") {
        throw new Error(
          `Mathpix extraction failed for ${doc.file_name}: ${status.error}`
        );
      }

      totalPages += status.num_pages || 0;

      // Get the extracted text
      const result = await getResult(submitResult.pdf_id);

      if (!result.mmd) {
        throw new Error(`No text extracted from ${doc.file_name}`);
      }

      // Store extracted text
      await supabase
        .from("documents")
        .update({
          extracted_text: result.mmd,
          status: "extracted",
          extraction_metadata: {
            mathpix_job_id: submitResult.pdf_id,
            page_count: status.num_pages,
            processing_time_ms: undefined,
            confidence_score: undefined,
          },
        })
        .eq("id", doc.id);

      // Chunk the extracted text
      const chunks = chunkText(result.mmd);

      // Insert chunks into database
      if (chunks.length > 0) {
        const chunkInserts = chunks.map((chunk) => ({
          document_id: doc.id,
          analysis_id: analysisId,
          chunk_index: chunk.chunkIndex,
          content: chunk.content,
          token_count: chunk.tokenCount,
          category: classifyChunk(chunk.content),
        }));

        const { error: chunkError } = await supabase
          .from("chunks")
          .insert(chunkInserts);

        if (chunkError) {
          console.error(`Failed to insert chunks for ${doc.file_name}:`, chunkError);
          throw new Error(`Chunk insertion failed: ${chunkError.message}`);
        }
      }
    } catch (docError) {
      // Mark individual document as failed but continue with others
      console.error(`Extraction failed for ${doc.file_name}:`, docError);

      await supabase
        .from("documents")
        .update({
          status: "failed",
          extraction_metadata: {
            error:
              docError instanceof Error
                ? docError.message
                : String(docError),
          },
        })
        .eq("id", doc.id);
    }
  }

  // If using webhooks, we stop here and the webhook handler continues
  if (options.useWebhook) {
    return;
  }

  // Update total pages count
  if (totalPages > 0) {
    await supabase
      .from("analyses")
      .update({ total_pages: totalPages })
      .eq("id", analysisId);
  }

  // Check if any documents were successfully extracted
  const { data: extractedDocs } = await supabase
    .from("documents")
    .select("id")
    .eq("analysis_id", analysisId)
    .eq("status", "extracted");

  if (!extractedDocs?.length) {
    throw new Error("No documents could be successfully extracted");
  }
}

/**
 * Process a single document after Mathpix webhook callback.
 * Called by the webhook handler when extraction completes.
 */
export async function processExtractedDocument(
  documentId: string,
  mathpixPdfId: string
): Promise<{ analysisId: string; allComplete: boolean }> {
  const supabase = createAdminClient();

  // Get the result from Mathpix
  const result = await getResult(mathpixPdfId);
  const status = await import("@/lib/mathpix/client").then((m) =>
    m.checkStatus(mathpixPdfId)
  );

  if (!result.mmd) {
    await supabase
      .from("documents")
      .update({
        status: "failed",
        extraction_metadata: { error: "No text extracted" },
      })
      .eq("id", documentId);

    // Still check if all docs are done
    const { data: doc } = await supabase
      .from("documents")
      .select("analysis_id")
      .eq("id", documentId)
      .single();

    return {
      analysisId: doc?.analysis_id || "",
      allComplete: await checkAllDocumentsComplete(doc?.analysis_id || ""),
    };
  }

  // Store extracted text
  const { data: doc } = await supabase
    .from("documents")
    .update({
      extracted_text: result.mmd,
      status: "extracted",
      extraction_metadata: {
        mathpix_job_id: mathpixPdfId,
        page_count: status.num_pages,
      },
    })
    .eq("id", documentId)
    .select("analysis_id")
    .single();

  const analysisId = doc?.analysis_id || "";

  // Chunk the text
  const chunks = chunkText(result.mmd);

  if (chunks.length > 0 && analysisId) {
    const chunkInserts = chunks.map((chunk) => ({
      document_id: documentId,
      analysis_id: analysisId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      token_count: chunk.tokenCount,
      category: classifyChunk(chunk.content),
    }));

    await supabase.from("chunks").insert(chunkInserts);
  }

  // Update total pages for the analysis
  if (status.num_pages && analysisId) {
    const { data: analysis } = await supabase
      .from("analyses")
      .select("total_pages")
      .eq("id", analysisId)
      .single();

    await supabase
      .from("analyses")
      .update({
        total_pages: ((analysis?.total_pages as number) || 0) + (status.num_pages || 0),
      })
      .eq("id", analysisId);
  }

  const allComplete = await checkAllDocumentsComplete(analysisId);
  return { analysisId, allComplete };
}

/**
 * Check if all documents for an analysis have been extracted.
 */
async function checkAllDocumentsComplete(
  analysisId: string
): Promise<boolean> {
  if (!analysisId) return false;

  const supabase = createAdminClient();

  const { data: docs } = await supabase
    .from("documents")
    .select("status")
    .eq("analysis_id", analysisId);

  if (!docs?.length) return false;

  return docs.every(
    (d) => d.status === "extracted" || d.status === "failed"
  );
}
