import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalysisStatus, PipelineStage } from "@/types";

/**
 * Update analysis stage and status in the database.
 */
export async function updateAnalysisStage(
  analysisId: string,
  stage: PipelineStage,
  status: AnalysisStatus
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("analyses")
    .update({ stage, status, updated_at: new Date().toISOString() })
    .eq("id", analysisId);

  if (error) {
    console.error(`Failed to update analysis ${analysisId} to stage ${stage}:`, error);
    throw error;
  }
}

/**
 * Mark analysis as failed with an error message.
 */
export async function failAnalysis(
  analysisId: string,
  errorMessage: string,
  stage?: PipelineStage
): Promise<void> {
  const supabase = createAdminClient();

  const update: Record<string, unknown> = {
    status: "failed" as AnalysisStatus,
    error_message: errorMessage,
    updated_at: new Date().toISOString(),
  };

  if (stage !== undefined) {
    update.stage = stage;
  }

  await supabase.from("analyses").update(update).eq("id", analysisId);
}

/**
 * Mark analysis as completed.
 */
export async function completeAnalysis(
  analysisId: string,
  processingTimeMs: number
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("analyses")
    .update({
      status: "completed" as AnalysisStatus,
      stage: 9 as PipelineStage,
      processing_time_ms: processingTimeMs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", analysisId);
}

/**
 * Retry a function with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    onRetry,
  }: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelayMs * Math.pow(2, attempt), maxDelayMs);
        onRetry?.(lastError, attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if an analysis has been cancelled.
 */
export async function isAnalysisCancelled(analysisId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("analyses")
    .select("status")
    .eq("id", analysisId)
    .single();

  return data?.status === "failed";
}
