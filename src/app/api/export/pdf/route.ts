import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exportQuerySchema } from "@/lib/validation/schemas";
import { requireSession, validateQuery } from "@/lib/validation/helpers";

export async function GET(request: NextRequest) {
  try {
    const session = requireSession(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const validation = validateQuery(exportQuerySchema, searchParams);
    if ("error" in validation) return validation.error;
    const { analysisId } = validation.data;

    const supabase = createAdminClient();

    const { data: analysis } = await supabase
      .from("analyses")
      .select("result_report_url")
      .eq("id", analysisId)
      .eq("session_id", session.sessionId)
      .single();

    if (!analysis?.result_report_url) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const { data: signedUrl } = await supabase.storage
      .from("reports")
      .createSignedUrl(analysis.result_report_url, 3600);

    if (!signedUrl) {
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
