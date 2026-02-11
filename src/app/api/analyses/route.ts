import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/validation/helpers";

export async function GET(request: NextRequest) {
  try {
    const session = requireSession(request);
    if (session instanceof NextResponse) return session;

    const supabase = createAdminClient();

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select(
        `
        id,
        status,
        stage,
        total_pages,
        created_at,
        documents (file_name)
      `
      )
      .eq("session_id", session.sessionId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch analyses:", error);
      return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 });
    }

    return NextResponse.json({ analyses: analyses || [] });
  } catch (error) {
    console.error("Analyses list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
