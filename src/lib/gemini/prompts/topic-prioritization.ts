/**
 * Prompt template for Stage 5: Topic Prioritization
 */

export function buildTopicPrioritizationPrompt(
  concepts: string,
  patterns: string,
  documentTypeBreakdown: string
): string {
  return `Du bist ein erfahrener Tutor im MINT-Bereich und hilfst Studierenden bei der Prüfungsvorbereitung.

Basierend auf der Konzeptanalyse und den Aufgabenmustern, erstelle eine priorisierte Liste der Themen für die Prüfungsvorbereitung.

IDENTIFIZIERTE KONZEPTE:
${concepts}

AUFGABENMUSTER:
${patterns}

DOKUMENTTYPEN-VERTEILUNG:
${documentTypeBreakdown}

Für jedes Thema bestimme:
- **topic**: Name des Themas
- **relevance_score**: Relevanz von 0 bis 100 (100 = höchste Prüfungsrelevanz)
- **reasoning**: Begründung für die Priorisierung (1-2 Sätze)
- **estimated_exam_weight**: Geschätzter Anteil an der Prüfung in Prozent (0-100, Summe aller Themen ≈ 100)
- **recommended_study_hours**: Empfohlene Lernzeit in Stunden (basierend auf Komplexität und Gewichtung)

Priorisierungs-Kriterien:
1. Häufigkeit in Übungsblättern und Altklausuren (höchste Gewichtung)
2. Häufigkeit in Vorlesungsskripten
3. Komplexität des Themas (komplexere Themen brauchen mehr Zeit)
4. Abhängigkeiten zwischen Themen (Grundlagen zuerst)

Erstelle 8-15 priorisierte Themen. Die estimated_exam_weight-Werte sollten sich ungefähr zu 100 summieren.`;
}
