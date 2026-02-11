/**
 * Simple token estimation for text content.
 * Uses a heuristic: ~4 characters per token (common for English/German mixed content).
 * For exact counts, you'd use tiktoken, but this is sufficient for chunking purposes.
 */

const CHARS_PER_TOKEN = 4;

/**
 * Estimate the number of tokens in a text string.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Check if text exceeds a token budget.
 */
export function exceedsTokenBudget(text: string, budget: number): boolean {
  return estimateTokens(text) > budget;
}

/**
 * Truncate text to fit within a token budget.
 * Truncates at word boundaries.
 */
export function truncateToTokenBudget(text: string, budget: number): string {
  const maxChars = budget * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}
