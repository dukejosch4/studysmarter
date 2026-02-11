"use client";

import { useRouter } from "next/navigation";
import { FileText, ArrowLeft } from "lucide-react";
import { PipelineProgress } from "./PipelineProgress";
import { Button } from "@/components/shared";
import { useAnalysis } from "@/hooks/useAnalysis";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ExportButtons } from "@/components/export/ExportButtons";
import {
  ConceptMap,
  TaskPatterns,
  PriorityList,
  ExamProblems,
  StudyPlan,
  FlashcardDeck,
} from "@/components/results";
import type {
  Concept,
  TaskPattern,
  Priority,
  ExamProblem,
  StudyPlanDay,
  Flashcard,
} from "@/types";

type AnalysisDashboardProps = {
  analysisId: string;
};

export function AnalysisDashboard({ analysisId }: AnalysisDashboardProps) {
  const router = useRouter();
  const { analysis, documents, isLoading, error, isProcessing } =
    useAnalysis(analysisId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" label="Analyse wird geladen..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || "Analyse nicht gefunden"}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </Button>
      </div>
    );
  }

  const concepts = analysis.resultConcepts as Concept[] | null;
  const patterns = analysis.resultTaskPatterns as TaskPattern[] | null;
  const priorities = analysis.resultPriorities as Priority[] | null;
  const examProblems = analysis.resultExamProblems as ExamProblem[] | null;
  const studyPlan = analysis.resultStudyPlan as StudyPlanDay[] | null;
  const flashcards = analysis.resultFlashcards as Flashcard[] | null;

  return (
    <div className="space-y-8">
      {/* Pipeline Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <PipelineProgress
          currentStage={analysis.stage}
          status={analysis.status}
          errorMessage={analysis.errorMessage}
          totalPages={analysis.totalPages}
        />
      </div>

      {/* Documents */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Hochgeladene Dateien
        </h2>
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 py-3">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span className="flex-1 text-sm text-gray-700">
                {doc.file_name}
              </span>
              <span className="text-xs text-gray-400">
                {formatDocType(doc.doc_type)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Results - shown progressively as they become available */}
      {concepts && concepts.length > 0 && <ConceptMap concepts={concepts} />}

      {patterns && patterns.length > 0 && <TaskPatterns patterns={patterns} />}

      {priorities && priorities.length > 0 && (
        <PriorityList priorities={priorities} />
      )}

      {examProblems && examProblems.length > 0 && (
        <ExamProblems problems={examProblems} />
      )}

      {studyPlan && studyPlan.length > 0 && <StudyPlan days={studyPlan} />}

      {flashcards && flashcards.length > 0 && (
        <FlashcardDeck flashcards={flashcards} />
      )}

      {/* Export buttons */}
      {analysis.status === "completed" && (
        <ExportButtons
          analysisId={analysisId}
          hasReport={!!analysis.resultReportUrl}
          hasFlashcards={!!flashcards && flashcards.length > 0}
        />
      )}

      {/* Processing info */}
      {isProcessing && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 text-center">
          <LoadingSpinner size="md" />
          <p className="mt-3 text-sm text-indigo-700">
            Deine Unterlagen werden analysiert. Dies kann einige Minuten dauern.
          </p>
          <p className="mt-1 text-xs text-indigo-500">
            Du kannst diese Seite geöffnet lassen — der Fortschritt wird
            automatisch aktualisiert.
          </p>
        </div>
      )}

      {/* Cancel button */}
      {isProcessing && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={async () => {
              await fetch(`/api/analysis/${analysisId}/cancel`, {
                method: "POST",
              });
            }}
          >
            Analyse abbrechen
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDocType(type: string): string {
  const labels: Record<string, string> = {
    lecture_script: "Skript",
    exercise_sheet: "Übung",
    solution: "Lösung",
    old_exam: "Altklausur",
    notes: "Notizen",
  };
  return labels[type] || type;
}
