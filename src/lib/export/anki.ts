import type { Flashcard } from "@/types";

/**
 * Generate an Anki-importable text file from flashcards.
 *
 * Format: Tab-separated values with front\tback\ttags
 * Anki can import this as a plain text file.
 * First line is a comment with import instructions.
 */
export function generateAnkiExport(flashcards: Flashcard[]): string {
  const lines: string[] = [
    "# StudySmarter Karteikarten-Export",
    "# Format: Frage\\tAntwort\\tTags",
    "# Import in Anki: Datei > Importieren > Textdatei",
    "#separator:tab",
    "#html:true",
    "#columns:Front\tBack\tTags",
    "",
  ];

  for (const card of flashcards) {
    // Escape tabs and newlines in content
    const front = escapeAnkiField(card.front);
    const back = escapeAnkiField(card.back);
    const tags = card.tags.join(" ");

    lines.push(`${front}\t${back}\t${tags}`);
  }

  return lines.join("\n");
}

function escapeAnkiField(text: string): string {
  // Convert LaTeX delimiters to Anki MathJax format
  let result = text
    .replace(/\$\$([\s\S]+?)\$\$/g, "\\[$1\\]") // Display math
    .replace(/\$([^\$\n]+?)\$/g, "\\($1\\)"); // Inline math

  // Escape HTML special chars but keep the math
  result = result
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert newlines to <br> for Anki HTML mode
  result = result.replace(/\n/g, "<br>");

  // Escape tabs
  result = result.replace(/\t/g, " ");

  return result;
}
