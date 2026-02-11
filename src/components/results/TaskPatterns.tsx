"use client";

import {
  Calculator,
  BookOpen,
  CheckSquare,
  MessageSquare,
  PenTool,
  Blocks,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPattern } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared";
import { Badge } from "@/components/shared";

type TaskPatternsProps = {
  patterns: TaskPattern[];
};

const TASK_TYPE_CONFIG: Record<
  TaskPattern["type"],
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

function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return "Leicht";
  if (difficulty <= 6) return "Mittel";
  return "Schwer";
}

function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return "bg-green-500";
  if (difficulty <= 6) return "bg-amber-500";
  return "bg-red-500";
}

export function TaskPatterns({ patterns }: TaskPatternsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <CardTitle>Aufgabenmuster</CardTitle>
        </div>
        <CardDescription>
          Analyse der Aufgabentypen und Schwierigkeitsgrade in deinen Unterlagen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patterns.map((pattern) => {
            const config = TASK_TYPE_CONFIG[pattern.type];
            const Icon = config.icon;

            return (
              <div
                key={pattern.type}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
              >
                {/* Header: icon + type + frequency */}
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      config.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {config.label}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {pattern.frequency}x in den Unterlagen gefunden
                    </span>
                  </div>
                  <Badge
                    variant={
                      pattern.difficulty >= 7
                        ? "error"
                        : pattern.difficulty >= 4
                          ? "warning"
                          : "success"
                    }
                    size="sm"
                  >
                    {getDifficultyLabel(pattern.difficulty)}
                  </Badge>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm text-gray-600">
                  {pattern.description}
                </p>

                {/* Difficulty bar */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Schwierigkeitsgrad
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {pattern.difficulty}/10
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getDifficultyColor(pattern.difficulty)
                      )}
                      style={{
                        width: `${(pattern.difficulty / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Example topics */}
                {pattern.example_topics.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-500">
                      Beispielthemen
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {pattern.example_topics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {patterns.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              Keine Aufgabenmuster erkannt.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
