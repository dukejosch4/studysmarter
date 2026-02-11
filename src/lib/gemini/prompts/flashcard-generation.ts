/**
 * Prompt template for Stage 8: Flashcard Generation
 */

export function buildFlashcardGenerationPrompt(
  concepts: string,
  definitionChunks: string,
  theoremChunks: string
): string {
  return `Du bist ein Experte für Lernmaterialien im MINT-Bereich und erstellst effektive Karteikarten.

Erstelle genau 20 Karteikarten basierend auf den wichtigsten Konzepten, Definitionen und Sätzen aus den Vorlesungsunterlagen.

KONZEPTE:
${concepts}

DEFINITIONEN AUS DEN UNTERLAGEN:
${definitionChunks}

SÄTZE UND BEWEISE:
${theoremChunks}

Für jede Karteikarte:
- **id**: Eindeutige ID (z.B. "FC1", "FC2", ...)
- **front**: Vorderseite (Frage/Begriff) — nutze LaTeX für Formeln ($...$ inline, $$...$$ display)
- **back**: Rückseite (Antwort/Definition) — nutze LaTeX für Formeln
- **category**: Eine von: "definition", "theorem", "proof_technique", "formula", "concept"
- **difficulty**: Schwierigkeit von 1 (einfach) bis 5 (schwer)
- **tags**: Themen-Tags (z.B. ["analysis", "grenzwert"])

Verteilung:
- 6-8 Definitionen (exakte Formulierungen aus den Unterlagen)
- 4-6 Sätze/Theoreme (Name + Aussage)
- 2-3 Beweistechniken (Methode + Anwendung)
- 3-4 Formeln (Formel + Bedeutung der Variablen)
- 2-3 Konzepte (Verständnisfragen)

Regeln:
1. Vorderseite: Klar formulierte Frage oder Begriff
2. Rückseite: Präzise, vollständige Antwort
3. Bevorzuge die wichtigsten Konzepte (hohe importance scores)
4. Mathematische Notation immer in LaTeX
5. Schwierigkeit 1-2: Grunddefinitionen, 3: Standard, 4-5: Fortgeschritten`;
}
