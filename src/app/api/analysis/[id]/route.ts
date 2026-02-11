import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uuidSchema } from "@/lib/validation/schemas";
import { requireSession } from "@/lib/validation/helpers";

export async function GET(
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

    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("session_id", session.sessionId)
      .single();

    if (error || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const { data: documents } = await supabase
      .from("documents")
      .select("id, file_name, file_size, doc_type, status")
      .eq("analysis_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      analysis: {
        id: analysis.id,
        status: analysis.status,
        stage: analysis.stage,
        totalPages: analysis.total_pages,
        totalTokensUsed: analysis.total_tokens_used,
        processingTimeMs: analysis.processing_time_ms,
        errorMessage: analysis.error_message,
        resultConcepts: analysis.result_concepts,
        resultTaskPatterns: analysis.result_task_patterns,
        resultPriorities: analysis.result_priorities,
        resultExamProblems: analysis.result_exam_problems,
        resultStudyPlan: analysis.result_study_plan,
        resultFlashcards: analysis.result_flashcards,
        resultReportUrl: analysis.result_report_url,
        createdAt: analysis.created_at,
        updatedAt: analysis.updated_at,
      },
      documents: documents || [],
    });
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
