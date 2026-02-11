/**
 * Prompt template for Stage 3: Concept Extraction
 */

export function buildConceptExtractionPrompt(
  extractedText: string,
  documentTypes: string[]
): string {
  const docTypeInfo = documentTypes.length
    ? `Dokumenttypen: ${documentTypes.join(", ")}`
    : "";

  return `Du bist ein Experte für die Analyse von Vorlesungsunterlagen im MINT-Bereich.

Analysiere den folgenden Text aus Vorlesungsunterlagen und identifiziere die wichtigsten Konzepte.

${docTypeInfo}

Für jedes Konzept bestimme:
- **name**: Der Name des Konzepts (z.B. "Grenzwert", "Eigenwert", "Normalverteilung")
- **description**: Eine kurze Beschreibung (1-2 Sätze)
- **importance**: Wichtigkeit von 1 (gering) bis 10 (sehr hoch) — basierend auf wie zentral das Konzept für das Fach ist
- **frequency**: Wie oft das Konzept in den Unterlagen vorkommt
- **related_concepts**: Verwandte Konzepte (als Array von Strings)
- **category**: Fachbereich (z.B. "analysis", "lineare_algebra", "stochastik", "numerik", "mechanik")

Identifiziere 15-30 Konzepte, sortiert nach Wichtigkeit. Berücksichtige:
- Konzepte, die in mehreren Dokumenten vorkommen, sind wichtiger
- Konzepte aus Übungsblättern/Altklausuren haben höhere Prüfungsrelevanz
- Grundlegende Definitionen und Sätze sind meistens wichtiger als Beispiele

TEXT:
${extractedText}`;
}
