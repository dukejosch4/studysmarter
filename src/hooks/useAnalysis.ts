"use client";

import { useState, useEffect, useCallback } from "react";

type AnalysisStatus =
  | "pending"
  | "uploading"
  | "extracting"
  | "analyzing"
  | "generating"
  | "completed"
  | "failed";

type AnalysisData = {
  id: string;
  status: AnalysisStatus;
  stage: number;
  totalPages: number;
  totalTokensUsed: number;
  processingTimeMs: number | null;
  errorMessage: string | null;
  resultConcepts: unknown | null;
  resultTaskPatterns: unknown | null;
  resultPriorities: unknown | null;
  resultExamProblems: unknown | null;
  resultStudyPlan: unknown | null;
  resultFlashcards: unknown | null;
  resultReportUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type DocumentData = {
  id: string;
  file_name: string;
  file_size: number;
  doc_type: string;
  status: string;
};

type UseAnalysisReturn = {
  analysis: AnalysisData | null;
  documents: DocumentData[];
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  refresh: () => Promise<void>;
};

export function useAnalysis(analysisId: string): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProcessing =
    analysis !== null &&
    analysis.status !== "completed" &&
    analysis.status !== "failed";

  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch analysis");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setDocuments(data.documents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchAnalysis();

    // Poll every 3 seconds while processing
    const interval = setInterval(() => {
      if (
        analysis === null ||
        (analysis.status !== "completed" && analysis.status !== "failed")
      ) {
        fetchAnalysis();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchAnalysis, analysis?.status]);

  return {
    analysis,
    documents,
    isLoading,
    error,
    isProcessing,
    refresh: fetchAnalysis,
  };
}
