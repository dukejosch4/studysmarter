import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnalysisSchema } from "@/lib/validation/schemas";
import { requireSession, validateBody } from "@/lib/validation/helpers";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const session = requireSession(request);
    if (session instanceof NextResponse) return session;
    const { sessionId } = session;

    // Rate limit: 5 analyses per minute per session
    const rateLimit = checkRateLimit(`analysis:${sessionId}`, { maxRequests: 5, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warte einen Moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = validateBody(createAnalysisSchema, body);
    if ("error" in validation) return validation.error;
    const { documentIds } = validation.data;

    const supabase = createAdminClient();

    // Verify session exists and has credits
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!sessionData) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (sessionData.credits < 1) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
    }

    // Create analysis
    const analysisId = crypto.randomUUID();
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        id: analysisId,
        session_id: sessionId,
        user_id: sessionData.user_id,
        status: "pending",
        stage: 0,
      })
      .select()
      .single();

    if (analysisError) {
      console.error("Analysis creation error:", analysisError);
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 });
    }

    // Link documents to analysis
    const { error: linkError } = await supabase
      .from("documents")
      .update({ analysis_id: analysisId })
      .in("id", documentIds);

    if (linkError) {
      console.error("Document link error:", linkError);
      return NextResponse.json({ error: "Failed to link documents" }, { status: 500 });
    }

    // Deduct credit
    await supabase
      .from("sessions")
      .update({ credits: sessionData.credits - 1 })
      .eq("id", sessionId);

    // Count total pages
    const { count } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("analysis_id", analysisId);

    // Trigger pipeline (fire and forget)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    fetch(`${appUrl}/api/pipeline/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PIPELINE_SECRET}`,
      },
      body: JSON.stringify({ analysisId }),
    }).catch(console.error);

    return NextResponse.json({
      analysisId: analysis.id,
      status: analysis.status,
      documentCount: count || documentIds.length,
    });
  } catch (error) {
    console.error("Analysis creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
