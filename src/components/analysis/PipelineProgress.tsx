"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Circle,
  AlertCircle,
  Upload,
  FileSearch,
  Brain,
  Layers,
  Target,
  PenTool,
  Calendar,
  BookOpen,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: 0, label: "Initialisierung", icon: Sparkles, description: "Analyse wird vorbereitet..." },
  { id: 1, label: "Upload", icon: Upload, description: "Dateien werden verarbeitet..." },
  { id: 2, label: "PDF-Extraktion", icon: FileSearch, description: "Text und Formeln werden extrahiert..." },
  { id: 3, label: "Konzept-Erkennung", icon: Brain, description: "Themen und Konzepte werden identifiziert..." },
  { id: 4, label: "Aufgabentyp-Analyse", icon: Layers, description: "Aufgabenmuster werden analysiert..." },
  { id: 5, label: "Themen-Priorisierung", icon: Target, description: "Prüfungsrelevanz wird bewertet..." },
  { id: 6, label: "Aufgaben-Generierung", icon: PenTool, description: "Trainingsaufgaben werden erstellt..." },
  { id: 7, label: "Lernplan", icon: Calendar, description: "Lernplan wird optimiert..." },
  { id: 8, label: "Karteikarten", icon: BookOpen, description: "Karteikarten werden generiert..." },
  { id: 9, label: "Report", icon: FileText, description: "PDF-Report wird erstellt..." },
] as const;

type PipelineProgressProps = {
  currentStage: number;
  status: string;
  errorMessage?: string | null;
  totalPages?: number | null;
};

export function PipelineProgress({
  currentStage,
  status,
  errorMessage,
  totalPages,
}: PipelineProgressProps) {
  const isFailed = status === "failed";
  const isCompleted = status === "completed";
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for elapsed time
  useEffect(() => {
    if (isCompleted || isFailed) return;

    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCompleted, isFailed]);

  const progressPercent = isCompleted ? 100 : (currentStage / 9) * 100;
  const activeStage = STAGES.find((s) => s.id === currentStage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Analyse-Fortschritt
        </h2>
        <div className="flex items-center gap-3">
          {!isCompleted && !isFailed && (
            <span className="text-xs text-gray-500">
              {formatTime(elapsedSeconds)}
            </span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Active stage description */}
      {activeStage && !isCompleted && !isFailed && (
        <div className="flex items-center gap-3 rounded-lg bg-indigo-50 px-4 py-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <div>
            <p className="text-sm font-medium text-indigo-900">
              {activeStage.label}
            </p>
            <p className="text-xs text-indigo-600">
              {activeStage.description}
              {totalPages && currentStage === 2
                ? ` (${totalPages} Seiten)`
                : ""}
            </p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Analyse abgeschlossen
            </p>
            <p className="text-xs text-green-600">
              Alle Ergebnisse stehen bereit.
              {totalPages ? ` ${totalPages} Seiten analysiert.` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            isFailed
              ? "bg-red-500"
              : isCompleted
                ? "bg-green-500"
                : "bg-indigo-500"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Stage {currentStage}/9</span>
        <span>{Math.round(progressPercent)}%</span>
      </div>

      {/* Stage grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STAGES.map((stage) => {
          const isActive =
            stage.id === currentStage && !isCompleted && !isFailed;
          const isDone = stage.id < currentStage || isCompleted;
          const isError = isFailed && stage.id === currentStage;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all duration-300",
                isDone && "bg-green-50 text-green-700",
                isActive && "bg-indigo-50 font-medium text-indigo-700 ring-1 ring-indigo-200",
                isError && "bg-red-50 text-red-700 ring-1 ring-red-200",
                !isDone && !isActive && !isError && "text-gray-400"
              )}
            >
              {isError ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              ) : isDone ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-50" />
              )}
              {stage.label}
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Fehler bei der Verarbeitung</p>
              <p className="mt-1 text-xs">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")} min`;
  }
  return `${secs}s`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Wartend", className: "bg-gray-100 text-gray-600" },
    uploading: { label: "Upload", className: "bg-blue-50 text-blue-700" },
    extracting: { label: "Extraktion", className: "bg-amber-50 text-amber-700" },
    analyzing: { label: "Analyse", className: "bg-indigo-50 text-indigo-700" },
    generating: { label: "Generierung", className: "bg-purple-50 text-purple-700" },
    completed: { label: "Fertig", className: "bg-green-50 text-green-700" },
    failed: { label: "Fehlgeschlagen", className: "bg-red-50 text-red-700" },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", className)}>
      {label}
    </span>
  );
}
