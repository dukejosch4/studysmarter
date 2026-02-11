import { createAdminClient } from "@/lib/supabase/admin";
import { generateReportPdf } from "@/lib/pdf/generator";
import { updateAnalysisStage } from "../utils";
import type { ReportData } from "@/lib/pdf/templates/report";
import type {
  Concept,
  TaskPattern,
  Priority,
  ExamProblem,
  StudyPlanDay,
  Flashcard,
} from "@/types";

/**
 * Stage 9: Compile PDF report from all analysis results.
 * Generates a PDF using @react-pdf/renderer and uploads to Supabase Storage.
 */
export async function executeStage9(analysisId: string): Promise<void> {
  const supabase = createAdminClient();

  await updateAnalysisStage(analysisId, 9, "generating");

  // Load all results
  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (error || !analysis) {
    throw new Error("Analysis not found for report generation");
  }

  // Get document names
  const { data: docs } = await supabase
    .from("documents")
    .select("file_name")
    .eq("analysis_id", analysisId);

  const reportData: ReportData = {
    concepts: (analysis.result_concepts as Concept[]) || [],
    taskPatterns: (analysis.result_task_patterns as TaskPattern[]) || [],
    priorities: (analysis.result_priorities as Priority[]) || [],
    examProblems: (analysis.result_exam_problems as ExamProblem[]) || [],
    studyPlan: (analysis.result_study_plan as StudyPlanDay[]) || [],
    flashcards: (analysis.result_flashcards as Flashcard[]) || [],
    totalPages: (analysis.total_pages as number) || 0,
    processingTimeMs: (analysis.processing_time_ms as number) || 0,
    documentNames: docs?.map((d) => d.file_name) || [],
    createdAt: analysis.created_at,
  };

  // Generate PDF
  const pdfBuffer = await generateReportPdf(reportData);

  // Upload to Supabase Storage
  const storagePath = `${analysisId}/report.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("reports")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload report: ${uploadError.message}`);
  }

  // Update analysis with report URL
  await supabase
    .from("analyses")
    .update({ result_report_url: storagePath })
    .eq("id", analysisId);

  console.log(`[Stage 9] Report generated and uploaded for ${analysisId}`);
}
