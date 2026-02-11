"use client";

import { useState } from "react";
import {
  Calculator,
  BookOpen,
  CheckSquare,
  MessageSquare,
  PenTool,
  Blocks,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamProblem } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared";
import { Badge } from "@/components/shared";
import { MathRenderer } from "@/components/shared/MathRenderer";

type ExamProblemsProps = {
  problems: ExamProblem[];
};

const PROBLEM_TYPE_CONFIG: Record<
  ExamProblem["type"],
  { label: string; icon: typeof Calculator; color: string }
> = {
  calculation: {
    label: "Rechenaufgabe",
    icon: Calculator,
    color: "text-blue-600 bg-blue-100",
  },
  proof: {
    label: "Beweis",
    icon: BookOpen,
    color: "text-purple-600 bg-purple-100",
  },
  mc: {
    label: "Multiple Choice",
    icon: CheckSquare,
    color: "text-green-600 bg-green-100",
  },
  short_answer: {
    label: "Kurzantwort",
    icon: MessageSquare,
    color: "text-amber-600 bg-amber-100",
  },
  essay: {
    label: "Freitext / Essay",
    icon: PenTool,
    color: "text-rose-600 bg-rose-100",
  },
  modeling: {
    label: "Modellierung",
    icon: Blocks,
    color: "text-teal-600 bg-teal-100",
  },
};

function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return "bg-green-500";
  if (difficulty <= 6) return "bg-amber-500";
  return "bg-red-500";
}

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return "Leicht";
  if (difficulty <= 6) return "Mittel";
  return "Schwer";
}

export function ExamProblems({ problems }: ExamProblemsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hintsVisibleIds, setHintsVisibleIds] = useState<Set<string>>(
    new Set()
  );

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleHints(id: string) {
    setHintsVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-indigo-600" />
          <CardTitle>Klausuraufgaben</CardTitle>
        </div>
        <CardDescription>
          {problems.length} Aufgaben mit Loesungen zum Ueben generiert
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {problems.map((problem, index) => {
            const config = PROBLEM_TYPE_CONFIG[problem.type];
            const Icon = config.icon;
            const isExpanded = expandedIds.has(problem.id);
            const hintsVisible = hintsVisibleIds.has(problem.id);

            return (
              <div
                key={problem.id}
                className="rounded-lg border border-gray-100 bg-gray-50/50 transition-colors hover:bg-gray-50"
              >
                {/* Clickable header */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(problem.id)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  {/* Problem number */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {problem.title}
                      </h4>
                    </div>

                    {/* Badges row */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {/* Type badge */}
                      <Badge variant="default" size="sm">
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>

                      {/* Topic tag */}
                      <Badge variant="secondary" size="sm">
                        {problem.topic}
                      </Badge>

                      {/* Points badge */}
                      <Badge variant="success" size="sm">
                        <Award className="mr-1 h-3 w-3" />
                        {problem.points} {problem.points === 1 ? "Punkt" : "Punkte"}
                      </Badge>
                    </div>

                    {/* Difficulty bar */}
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          Schwierigkeitsgrad: {getDifficultyLabel(problem.difficulty)}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          {problem.difficulty}/10
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            getDifficultyColor(problem.difficulty)
                          )}
                          style={{
                            width: `${(problem.difficulty / 10) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="shrink-0 pt-1">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-4">
                    {/* Description */}
                    <div className="mb-4">
                      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Aufgabenstellung
                      </h5>
                      <div className="rounded-md bg-white p-3 ring-1 ring-gray-100">
                        <MathRenderer content={problem.description} className="text-sm text-gray-700 leading-relaxed" />
                      </div>
                    </div>

                    {/* Hints (toggleable) */}
                    {problem.hints.length > 0 && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHints(problem.id);
                          }}
                          className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 hover:text-amber-700"
                        >
                          <Lightbulb className="h-3.5 w-3.5" />
                          {hintsVisible
                            ? "Hinweise ausblenden"
                            : `${problem.hints.length} ${problem.hints.length === 1 ? "Hinweis" : "Hinweise"} anzeigen`}
                        </button>
                        {hintsVisible && (
                          <div className="space-y-2">
                            {problem.hints.map((hint, hintIndex) => (
                              <div
                                key={hintIndex}
                                className="flex gap-2 rounded-md bg-amber-50 p-3 ring-1 ring-amber-100"
                              >
                                <span className="shrink-0 text-xs font-bold text-amber-600">
                                  {hintIndex + 1}.
                                </span>
                                <MathRenderer
                                  content={hint}
                                  className="text-xs text-amber-800 leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Solution */}
                    <div>
                      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-600">
                        Loesung
                      </h5>
                      <div className="rounded-md bg-green-50 p-3 ring-1 ring-green-100">
                        <MathRenderer
                          content={problem.solution}
                          className="text-sm text-green-900 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {problems.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              Keine Klausuraufgaben verfuegbar.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
