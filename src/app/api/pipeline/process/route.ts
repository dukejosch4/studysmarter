import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { executePipeline } from "@/lib/pipeline/executor";
import { pipelineProcessSchema } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/helpers";
import type { PipelineStage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Verify pipeline secret
    const authHeader = request.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.PIPELINE_SECRET}`;

    if (!authHeader || authHeader !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateBody(pipelineProcessSchema, body);
    if ("error" in validation) return validation.error;
    const { analysisId, startFromStage } = validation.data;

    const supabase = createAdminClient();

    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (error || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.status === "completed" || analysis.status === "failed") {
      return NextResponse.json({
        message: "Analysis already finished",
        status: analysis.status,
      });
    }

    // Execute pipeline (non-blocking)
    executePipeline(analysisId, {
      useWebhook: !!process.env.MATHPIX_WEBHOOK_ENABLED,
      startFromStage: startFromStage as PipelineStage | undefined,
    }).catch((err) => {
      console.error(`Pipeline failed for ${analysisId}:`, err);
    });

    return NextResponse.json({
      message: "Pipeline started",
      analysisId,
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return NextResponse.json({ error: "Pipeline processing failed" }, { status: 500 });
  }
}
