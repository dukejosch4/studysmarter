/**
 * Prompt template for Stage 4: Task Pattern Analysis
 */

export function buildTaskPatternsPrompt(
  exerciseChunks: string,
  concepts: string
): string {
  return `Du bist ein Experte für die Analyse von Prüfungsaufgaben im MINT-Bereich.

Analysiere die folgenden Übungsaufgaben und Klausuraufgaben. Identifiziere wiederkehrende Aufgabenmuster.

Bereits identifizierte Konzepte:
${concepts}

Für jedes Muster bestimme:
- **type**: Art der Aufgabe — eine von: "calculation" (Rechenaufgabe), "proof" (Beweis), "mc" (Multiple Choice), "short_answer" (Kurzantwort), "essay" (Textaufgabe), "modeling" (Modellierungsaufgabe)
- **frequency**: Wie oft dieses Muster in den Unterlagen vorkommt
- **difficulty**: Durchschnittliche Schwierigkeit von 1 (leicht) bis 10 (schwer)
- **example_topics**: Themen, bei denen dieses Muster typisch ist
- **description**: Beschreibung des Musters (z.B. "Berechnung von Eigenwerten einer 3x3-Matrix")

Achte besonders auf:
- Aufgaben aus Altklausuren (höchste Relevanz für die Prüfung)
- Wiederkehrende Aufgabenstrukturen (z.B. "Zeigen Sie, dass..." oder "Berechnen Sie...")
- Die Verteilung der Aufgabentypen (wie viel Rechnen vs. Beweisen)

ÜBUNGSAUFGABEN UND KLAUSURTEXT:
${exerciseChunks}`;
}
