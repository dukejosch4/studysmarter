import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAnkiExport } from "@/lib/export/anki";
import { exportQuerySchema } from "@/lib/validation/schemas";
import { requireSession, validateQuery } from "@/lib/validation/helpers";
import type { Flashcard } from "@/types";

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
      .select("result_flashcards")
      .eq("id", analysisId)
      .eq("session_id", session.sessionId)
      .single();

    const flashcards = analysis?.result_flashcards as Flashcard[] | null;

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json({ error: "No flashcards found" }, { status: 404 });
    }

    const ankiText = generateAnkiExport(flashcards);

    return new NextResponse(ankiText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="studysmarter-karteikarten.txt"`,
      },
    });
  } catch (error) {
    console.error("Anki export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
