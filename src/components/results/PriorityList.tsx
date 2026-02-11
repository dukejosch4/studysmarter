"use client";

import {
  ListOrdered,
  Target,
  Clock,
  Scale,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared";
import { Badge } from "@/components/shared";

type PriorityListProps = {
  priorities: Priority[];
};

function getRelevanceColor(score: number): string {
  if (score >= 75) return "bg-indigo-600";
  if (score >= 50) return "bg-indigo-400";
  if (score >= 25) return "bg-indigo-300";
  return "bg-gray-400";
}

function getRelevanceBadgeVariant(
  score: number
): "default" | "success" | "warning" | "secondary" {
  if (score >= 75) return "default";
  if (score >= 50) return "success";
  if (score >= 25) return "warning";
  return "secondary";
}

export function PriorityList({ priorities }: PriorityListProps) {
  const sorted = [...priorities].sort(
    (a, b) => b.relevance_score - a.relevance_score
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-indigo-600" />
          <CardTitle>Themenpriorisierung</CardTitle>
        </div>
        <CardDescription>
          Themen nach Klausurrelevanz sortiert mit Lernempfehlungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.map((priority, index) => (
            <div
              key={priority.topic}
              className={cn(
                "rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50",
                index === 0 &&
                  "border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50"
              )}
            >
              {/* Header: rank + topic name + relevance badge */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    index === 0
                      ? "bg-indigo-600 text-white"
                      : index <= 2
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-200 text-gray-600"
                  )}
                >
                  {index + 1}
                </span>
                <h4 className="flex-1 text-sm font-semibold text-gray-900">
                  {priority.topic}
                </h4>
                <Badge
                  variant={getRelevanceBadgeVariant(priority.relevance_score)}
                  size="sm"
                >
                  <Target className="mr-1 h-3 w-3" />
                  {priority.relevance_score}% Relevanz
                </Badge>
              </div>

              {/* Relevance progress bar */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Klausurrelevanz
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {priority.relevance_score}/100
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      getRelevanceColor(priority.relevance_score)
                    )}
                    style={{ width: `${priority.relevance_score}%` }}
                  />
                </div>
              </div>

              {/* Stats row: exam weight + study hours */}
              <div className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Geschätzte Klausurgewichtung:
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    {priority.estimated_exam_weight}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Empfohlene Lernzeit:
                  </span>
                  <span className="text-xs font-semibold text-gray-700">
                    {priority.recommended_study_hours}{" "}
                    {priority.recommended_study_hours === 1
                      ? "Stunde"
                      : "Stunden"}
                  </span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="mt-3 flex gap-2 rounded-md bg-white p-3 ring-1 ring-gray-100">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <p className="text-xs leading-relaxed text-gray-600">
                  {priority.reasoning}
                </p>
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              Keine Themenpriorisierung verfügbar.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
