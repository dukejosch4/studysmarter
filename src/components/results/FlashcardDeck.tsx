"use client";

import { useState } from "react";
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared";
import { Badge } from "@/components/shared";
import { MathRenderer } from "@/components/shared/MathRenderer";

type FlashcardDeckProps = {
  flashcards: Flashcard[];
};

const CATEGORY_CONFIG: Record<
  Flashcard["category"],
  { label: string; variant: "default" | "success" | "warning" | "error" | "secondary" }
> = {
  definition: { label: "Definition", variant: "default" },
  theorem: { label: "Theorem", variant: "success" },
  proof_technique: { label: "Beweistechnik", variant: "warning" },
  formula: { label: "Formel", variant: "error" },
  concept: { label: "Konzept", variant: "secondary" },
};

function DifficultyDots({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-1" title={`Schwierigkeit: ${difficulty}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i < difficulty ? "bg-indigo-500" : "bg-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const totalCards = flashcards.length;
  const currentCard = flashcards[currentIndex] ?? null;

  function goToPrevious() {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
  }

  function goToNext() {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
  }

  function flipCard() {
    setIsFlipped((prev) => !prev);
  }

  if (totalCards === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <CardTitle>Karteikarten</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-gray-400">
            Keine Karteikarten verfuegbar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categoryConfig = currentCard
    ? CATEGORY_CONFIG[currentCard.category]
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          <CardTitle>Karteikarten</CardTitle>
        </div>
        <CardDescription>
          {totalCards} Karteikarten zum Lernen und Wiederholen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Karte {currentIndex + 1} von {totalCards}
            </span>
            {currentCard && categoryConfig && (
              <Badge variant={categoryConfig.variant} size="sm">
                {categoryConfig.label}
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / totalCards) * 100}%`,
              }}
            />
          </div>

          {/* Flashcard */}
          {currentCard && (
            <div className="perspective-1000">
              <button
                type="button"
                onClick={flipCard}
                className={cn(
                  "relative w-full cursor-pointer",
                  "transition-transform duration-500",
                  "[transform-style:preserve-3d]",
                  isFlipped && "[transform:rotateY(180deg)]"
                )}
                aria-label={isFlipped ? "Frage anzeigen" : "Antwort anzeigen"}
              >
                {/* Front side (Question) */}
                <div
                  className={cn(
                    "rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6",
                    "min-h-[200px] flex flex-col items-center justify-center",
                    "[backface-visibility:hidden]"
                  )}
                >
                  <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Frage
                  </span>
                  <MathRenderer
                    content={currentCard.front}
                    className="text-center text-base text-gray-800 leading-relaxed"
                  />
                  <span className="mt-4 text-xs text-gray-400">
                    Klicken zum Umdrehen
                  </span>
                </div>

                {/* Back side (Answer) */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6",
                    "min-h-[200px] flex flex-col items-center justify-center",
                    "[backface-visibility:hidden] [transform:rotateY(180deg)]"
                  )}
                >
                  <span className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-500">
                    Antwort
                  </span>
                  <MathRenderer
                    content={currentCard.back}
                    className="text-center text-base text-gray-800 leading-relaxed"
                  />
                  <span className="mt-4 text-xs text-gray-400">
                    Klicken zum Umdrehen
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Difficulty and tags */}
          {currentCard && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  Schwierigkeit:
                </span>
                <DifficultyDots difficulty={currentCard.difficulty} />
              </div>
              {currentCard.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="h-3 w-3 text-gray-400" />
                  {currentCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={goToPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="Vorherige Karte"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={flipCard}
              className="flex h-10 items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100"
            >
              <RotateCcw className="h-4 w-4" />
              Umdrehen
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="Naechste Karte"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
