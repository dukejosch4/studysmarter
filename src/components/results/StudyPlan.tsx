"use client";

import {
  CalendarDays,
  Clock,
  BookMarked,
  Target,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudyPlanDay } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared";
import { Badge } from "@/components/shared";

type StudyPlanProps = {
  days: StudyPlanDay[];
};

const DAY_LABELS: Record<number, string> = {
  1: "Tag 1",
  2: "Tag 2",
  3: "Tag 3",
  4: "Tag 4",
  5: "Tag 5",
  6: "Tag 6",
  7: "Tag 7",
};

const TIME_BLOCK_ICONS: Record<string, string> = {
  Morning: "Morgens",
  Afternoon: "Nachmittags",
  Evening: "Abends",
};

function getActiveDayIndex(days: StudyPlanDay[]): number {
  // Today is the first day of the plan
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  // Map to plan index: assume plan starts on the current day
  // Active day is day 1 (index 0) for simplicity, but we use a rolling approach
  // Just highlight day 1 as "today" since the plan is generated fresh
  return 0;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0)
    return `${hours} ${hours === 1 ? "Stunde" : "Stunden"}`;
  return `${hours} Std. ${remaining} Min.`;
}

function translateTimeBlock(block: string): string {
  return TIME_BLOCK_ICONS[block] || block;
}

export function StudyPlan({ days }: StudyPlanProps) {
  const activeDayIndex = getActiveDayIndex(days);
  const sorted = [...days].sort((a, b) => a.day - b.day);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <CardTitle>7-Tage Lernplan</CardTitle>
        </div>
        <CardDescription>
          Strukturierter Lernplan mit taeglichen Aufgaben und Zeitbloecken
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.map((day, index) => {
            const isActive = index === activeDayIndex;
            const totalMinutes = day.tasks.reduce(
              (sum, task) => sum + task.duration_minutes,
              0
            );

            return (
              <div
                key={day.day}
                className={cn(
                  "rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors",
                  isActive &&
                    "border-indigo-300 bg-indigo-50/40 ring-1 ring-indigo-200"
                )}
              >
                {/* Day header */}
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {DAY_LABELS[day.day] || `Tag ${day.day}`}
                      </h4>
                      {isActive && (
                        <Badge variant="default" size="sm">
                          Heute
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Target className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Schwerpunkt: {day.focus_topic}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {formatDuration(totalMinutes)} gesamt
                    </span>
                  </div>
                </div>

                {/* Tasks table */}
                <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-3 py-2 text-xs font-semibold text-gray-500">
                          Zeitblock
                        </th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-500">
                          Aktivitaet
                        </th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-500">
                          Dauer
                        </th>
                        <th className="px-3 py-2 text-xs font-semibold text-gray-500">
                          Ressourcen
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.tasks.map((task, taskIndex) => (
                        <tr
                          key={taskIndex}
                          className={cn(
                            "border-b border-gray-50 last:border-b-0",
                            taskIndex % 2 === 1 && "bg-gray-50/30"
                          )}
                        >
                          <td className="px-3 py-2 text-xs font-medium text-gray-700">
                            {translateTimeBlock(task.time_block)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600">
                            {task.activity}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-600">
                            {formatDuration(task.duration_minutes)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {task.resources.map((resource) => (
                                <span
                                  key={resource}
                                  className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                                >
                                  {resource}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Review topics */}
                {day.review_topics.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <RotateCcw className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">
                        Wiederholungsthemen
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {day.review_topics.map((topic) => (
                        <Badge key={topic} variant="secondary" size="sm">
                          <BookMarked className="mr-1 h-3 w-3" />
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {days.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              Kein Lernplan verfuegbar.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
