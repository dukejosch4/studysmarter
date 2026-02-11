import { executeStage1 } from "./stages/stage-1-upload";
import { executeStage2 } from "./stages/stage-2-extraction";
import { executeStage3 } from "./stages/stage-3-concepts";
import { executeStage4 } from "./stages/stage-4-patterns";
import { executeStage5 } from "./stages/stage-5-priorities";
import { executeStage6 } from "./stages/stage-6-exam-problems";
import { executeStage7 } from "./stages/stage-7-study-plan";
import { executeStage8 } from "./stages/stage-8-flashcards";
import { executeStage9 } from "./stages/stage-9-report";
import {
  updateAnalysisStage,
  failAnalysis,
  completeAnalysis,
  isAnalysisCancelled,
} from "./utils";
import type { PipelineStage } from "@/types";

export type PipelineOptions = {
  /** Use Mathpix webhooks instead of polling */
  useWebhook?: boolean;
  /** Start from a specific stage (for resuming) */
  startFromStage?: PipelineStage;
};

/**
 * Execute the full analysis pipeline.
 *
 * Stages:
 * 0 - Initialized
 * 1 - Documents validated
 * 2 - Text extraction (Mathpix)
 * 3 - Concept extraction (Gemini Pro)
 * 4 - Task pattern analysis (Gemini Pro)
 * 5 - Topic prioritization (Gemini Pro)
 * 6 - Exam problem generation (Gemini Pro)
 * 7 - Study plan generation (Gemini Pro)
 * 8 - Flashcard generation (Gemini Flash)
 * 9 - Report compilation (PDF)
 */
export async function executePipeline(
  analysisId: string,
  options: PipelineOptions = {}
): Promise<void> {
  const startTime = Date.now();
  const startStage = options.startFromStage || 0;

  try {
    // Stage 1: Validate uploads
    if (startStage <= 1) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 1: Validating uploads`);
      await executeStage1(analysisId);
    }

    // Stage 2: Extract text from PDFs
    if (startStage <= 2) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 2: Extracting text`);
      await executeStage2(analysisId, {
        useWebhook: options.useWebhook,
      });

      // If using webhooks, stop here — the webhook handler will resume
      if (options.useWebhook) {
        console.log(
          `[Pipeline ${analysisId}] Pausing for Mathpix webhooks...`
        );
        return;
      }
    }

    // Stage 3: Concept extraction
    if (startStage <= 3) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 3: Extracting concepts`);
      await executeStage3(analysisId);
    }

    // Stage 4: Task pattern analysis
    if (startStage <= 4) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 4: Analyzing task patterns`);
      await executeStage4(analysisId);
    }

    // Stage 5: Topic prioritization
    if (startStage <= 5) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 5: Prioritizing topics`);
      await executeStage5(analysisId);
    }

    // Stage 6: Exam problem generation
    if (startStage <= 6) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 6: Generating exam problems`);
      await executeStage6(analysisId);
    }

    // Stage 7: Study plan generation
    if (startStage <= 7) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 7: Generating study plan`);
      await executeStage7(analysisId);
    }

    // Stage 8: Flashcard generation
    if (startStage <= 8) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 8: Generating flashcards`);
      await executeStage8(analysisId);
    }

    // Stage 9: Report compilation
    if (startStage <= 9) {
      if (await isAnalysisCancelled(analysisId)) return;
      console.log(`[Pipeline ${analysisId}] Stage 9: Compiling report`);
      await executeStage9(analysisId);
    }

    // Mark as completed
    const processingTimeMs = Date.now() - startTime;
    await completeAnalysis(analysisId, processingTimeMs);
    console.log(
      `[Pipeline ${analysisId}] Completed in ${processingTimeMs}ms`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown pipeline error";
    console.error(`[Pipeline ${analysisId}] Failed:`, error);
    await failAnalysis(analysisId, errorMessage);
  }
}

/**
 * Resume the pipeline from Stage 3 after Mathpix extraction completes.
 * Called by the webhook handler.
 */
export async function resumePipelineAfterExtraction(
  analysisId: string
): Promise<void> {
  return executePipeline(analysisId, { startFromStage: 3 });
}
