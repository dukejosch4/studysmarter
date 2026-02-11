/**
 * Prompt template for Stage 6: Exam Problem Generation
 */

export function buildExamGenerationPrompt(
  priorities: string,
  patterns: string,
  exampleProblems: string
): string {
  return `Du bist ein erfahrener Professor im MINT-Bereich und erstellst Prüfungsaufgaben.

Erstelle genau 10 prüfungsnahe Trainingsaufgaben basierend auf der Themenpriorisierung und den identifizierten Aufgabenmustern. Die Aufgaben sollen den Stil und die Schwierigkeit einer echten Klausur widerspiegeln.

THEMENPRIORISIERUNG:
${priorities}

AUFGABENMUSTER:
${patterns}

BEISPIELE AUS DEN UNTERLAGEN:
${exampleProblems}

Für jede Aufgabe:
- **id**: Eindeutige ID (z.B. "P1", "P2", ...)
- **title**: Aussagekräftiger Titel
- **type**: "calculation", "proof", "mc", "short_answer", "essay", oder "modeling"
- **difficulty**: Schwierigkeit von 1 bis 10
- **topic**: Zugehöriges Thema
- **description**: Vollständige Aufgabenstellung (nutze LaTeX für mathematische Formeln mit $...$ für Inline und $$...$$ für Display)
- **hints**: 1-3 Lösungshinweise (abgestuft von allgemein zu spezifisch)
- **solution**: Ausführliche Musterlösung mit Rechenschritten (nutze LaTeX)
- **points**: Punktwert (typisch 5-20 Punkte, Summe ≈ 100)

Regeln:
1. Verteile die Aufgaben proportional zu estimated_exam_weight
2. Mische verschiedene Aufgabentypen (orientiert an den identifizierten Mustern)
3. Steigere die Schwierigkeit von Aufgabe 1 (leicht) bis Aufgabe 10 (schwer)
4. Jede Aufgabe muss eine vollständige, korrekte Musterlösung haben
5. Mathematische Notation in LaTeX: Inline $...$ und Display $$...$$`;
}
