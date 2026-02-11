"use client";

import {
  Brain,
  TrendingUp,
  Hash,
  Tag,
  Link,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Concept } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared";
import { Badge } from "@/components/shared";

type ConceptMapProps = {
  concepts: Concept[];
};

export function ConceptMap({ concepts }: ConceptMapProps) {
  const sorted = [...concepts].sort((a, b) => b.importance - a.importance);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <CardTitle>Erkannte Konzepte</CardTitle>
        </div>
        <CardDescription>
          {sorted.length} Konzepte aus deinen Unterlagen identifiziert, sortiert
          nach Wichtigkeit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.map((concept, index) => (
            <div
              key={concept.name}
              className={cn(
                "rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:bg-gray-50",
                index === 0 && "border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50"
              )}
            >
              {/* Header row: name + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {concept.name}
                </h4>
                <Badge variant="default" size="sm">
                  <Tag className="mr-1 h-3 w-3" />
                  {concept.category}
                </Badge>
                <Badge variant="secondary" size="sm">
                  <Hash className="mr-1 h-3 w-3" />
                  {concept.frequency}x gefunden
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-2 text-sm text-gray-600">{concept.description}</p>

              {/* Importance bar */}
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <TrendingUp className="h-3 w-3" />
                    Wichtigkeit
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {concept.importance}/10
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      concept.importance >= 8
                        ? "bg-indigo-600"
                        : concept.importance >= 5
                          ? "bg-indigo-400"
                          : "bg-indigo-300"
                    )}
                    style={{ width: `${(concept.importance / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Related concepts */}
              {concept.related_concepts.length > 0 && (
                <div className="mt-3">
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <Link className="h-3 w-3" />
                    Verwandte Konzepte
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {concept.related_concepts.map((related) => (
                      <span
                        key={related}
                        className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200"
                      >
                        {related}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {sorted.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              Keine Konzepte gefunden.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
