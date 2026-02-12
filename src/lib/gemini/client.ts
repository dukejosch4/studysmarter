import { GoogleGenAI } from "@google/genai";

let clientInstance: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!clientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY must be set");
    }
    clientInstance = new GoogleGenAI({ apiKey });
  }
  return clientInstance;
}

export type GeminiModel = "gemini-2.0-flash" | "gemini-2.5-pro";

export type GenerateOptions = {
  model?: GeminiModel;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** JSON schema for structured output (responseSchema) */
  responseSchema?: Record<string, unknown>;
};

/**
 * Generate content using Gemini.
 * Supports structured output via responseSchema.
 */
export async function generate(
  prompt: string,
  options: GenerateOptions = {}
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const client = getClient();
  const {
    model = "gemini-2.0-flash",
    systemInstruction,
    temperature = 0.3,
    maxOutputTokens = 8192,
    responseSchema,
  } = options;

  const config: Record<string, unknown> = {
    temperature,
    maxOutputTokens,
  };

  if (responseSchema) {
    config.responseMimeType = "application/json";
    config.responseJsonSchema = responseSchema;
  }

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      ...config,
      systemInstruction,
    },
  });

  const text = response.text ?? "";
  const usage = response.usageMetadata;

  return {
    text,
    inputTokens: usage?.promptTokenCount ?? 0,
    outputTokens: usage?.candidatesTokenCount ?? 0,
  };
}

/**
 * Generate structured JSON output using Gemini.
 * Automatically parses the response as JSON.
 */
export async function generateJSON<T = unknown>(
  prompt: string,
  options: GenerateOptions = {}
): Promise<{
  data: T;
  inputTokens: number;
  outputTokens: number;
}> {
  const result = await generate(prompt, options);

  try {
    // Clean up potential markdown code fences
    let jsonText = result.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }

    const data = JSON.parse(jsonText.trim()) as T;
    return {
      data,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
  } catch (parseError) {
    console.error("Failed to parse Gemini JSON response:", result.text);
    throw new Error(
      `Invalid JSON from Gemini: ${parseError instanceof Error ? parseError.message : String(parseError)}`
    );
  }
}

/**
 * Model selection helper based on task complexity.
 * Flash for simple tasks, Pro for complex analysis.
 */
export function selectModel(
  task:
    | "chunk-classification"
    | "concept-extraction"
    | "task-patterns"
    | "topic-prioritization"
    | "exam-generation"
    | "study-plan"
    | "flashcard-generation"
): GeminiModel {
  switch (task) {
    case "chunk-classification":
    case "flashcard-generation":
      return "gemini-2.0-flash";
    case "concept-extraction":
    case "task-patterns":
    case "topic-prioritization":
    case "exam-generation":
    case "study-plan":
      return "gemini-2.5-pro";
  }
}
