import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Token cost tracking per analysis.
 * Logs token usage and estimated costs for monitoring.
 */

// Cost per 1M tokens (USD)
const COSTS = {
  "gemini-flash-input": 0.15,
  "gemini-flash-output": 0.60,
  "gemini-pro-input": 2.50,
  "gemini-pro-output": 10.00,
  // With context caching (25% of input cost)
  "gemini-pro-cached-input": 0.625,
  "gemini-flash-cached-input": 0.0375,
} as const;

type TokenUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
};

/**
 * Calculate estimated cost for a token usage record.
 */
export function estimateCost(usage: TokenUsage): number {
  const isFlash = usage.model.includes("flash");
  const inputCostPer1M = isFlash
    ? COSTS["gemini-flash-input"]
    : COSTS["gemini-pro-input"];
  const outputCostPer1M = isFlash
    ? COSTS["gemini-flash-output"]
    : COSTS["gemini-pro-output"];
  const cachedCostPer1M = isFlash
    ? COSTS["gemini-flash-cached-input"]
    : COSTS["gemini-pro-cached-input"];

  const regularInput = usage.inputTokens - (usage.cachedInputTokens || 0);
  const cachedInput = usage.cachedInputTokens || 0;

  return (
    (regularInput / 1_000_000) * inputCostPer1M +
    (cachedInput / 1_000_000) * cachedCostPer1M +
    (usage.outputTokens / 1_000_000) * outputCostPer1M
  );
}

/**
 * Track token usage for an analysis by updating total_tokens_used.
 */
export async function trackTokenUsage(
  analysisId: string,
  usage: TokenUsage
): Promise<void> {
  const supabase = createAdminClient();
  const totalTokens = usage.inputTokens + usage.outputTokens;

  // Increment total_tokens_used
  const { data: analysis } = await supabase
    .from("analyses")
    .select("total_tokens_used")
    .eq("id", analysisId)
    .single();

  const currentTokens = (analysis?.total_tokens_used as number) || 0;

  await supabase
    .from("analyses")
    .update({
      total_tokens_used: currentTokens + totalTokens,
    })
    .eq("id", analysisId);
}
