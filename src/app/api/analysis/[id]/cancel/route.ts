import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidSchema } from "@/lib/validation/schemas";
import { requireSession } from "@/lib/validation/helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idValidation = uuidSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json({ error: "Invalid analysis ID" }, { status: 400 });
    }

    const session = requireSession(request);
    if (session instanceof NextResponse) return session;

    const supabase = createAdminClient();

    const { data: analysis } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("session_id", session.sessionId)
      .single();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.status === "completed" || analysis.status === "failed") {
      return NextResponse.json({ error: "Analysis already finished" }, { status: 400 });
    }

    const { error } = await supabase
      .from("analyses")
      .update({
        status: "failed",
        error_message: "Cancelled by user",
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to cancel analysis" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
