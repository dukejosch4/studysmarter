import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processExtractedDocument } from "@/lib/pipeline/stages/stage-2-extraction";
import { resumePipelineAfterExtraction } from "@/lib/pipeline/executor";
import { mathpixWebhookSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/helpers";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    // Rate limit webhooks: 60 per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`webhook:mathpix:${ip}`, { maxRequests: 60, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await request.json();
    const validation = validateBody(mathpixWebhookSchema, body);
    if ("error" in validation) return validation.error;
    const payload = validation.data;

    const supabase = createAdminClient();

    // Find the document with this Mathpix job ID
    const { data: doc, error } = await supabase
      .from("documents")
      .select("id, analysis_id, file_name")
      .eq("mathpix_job_id", payload.pdf_id)
      .single();

    if (error || !doc) {
      console.error(`Mathpix webhook: No document found for pdf_id ${payload.pdf_id}`);
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (payload.status === "error") {
      await supabase
        .from("documents")
        .update({
          status: "failed",
          extraction_metadata: {
            mathpix_job_id: payload.pdf_id,
            error: payload.error || "Mathpix extraction failed",
          },
        })
        .eq("id", doc.id);

      console.error(`Mathpix extraction failed for ${doc.file_name}: ${payload.error}`);
    } else if (payload.status === "completed") {
      const { analysisId, allComplete } = await processExtractedDocument(
        doc.id,
        payload.pdf_id
      );

      console.log(`Mathpix extraction complete for ${doc.file_name} (${payload.num_pages} pages)`);

      if (allComplete && analysisId) {
        console.log(`All documents extracted for analysis ${analysisId}, resuming pipeline...`);
        resumePipelineAfterExtraction(analysisId).catch((err) => {
          console.error(`Failed to resume pipeline for ${analysisId}:`, err);
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mathpix webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
