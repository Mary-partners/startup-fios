// ============================================================
// AI Provider Client
// Supports OpenAI and Anthropic (Claude) APIs.
// ============================================================

import OpenAI from "openai";

// Default to OpenAI; can be swapped to Anthropic SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export type AiProvider = "openai" | "anthropic";

interface AiCompletionParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

/**
 * Generic AI completion wrapper.
 * MVP uses OpenAI; swap the implementation to use Anthropic if preferred.
 */
export async function aiCompletion(
  params: AiCompletionParams
): Promise<string> {
  const {
    systemPrompt,
    userPrompt,
    model = "gpt-4o",
    temperature = 0.3,
    maxTokens = 2000,
    responseFormat = "text",
  } = params;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    response_format:
      responseFormat === "json" ? { type: "json_object" } : undefined,
  });

  return response.choices[0]?.message?.content ?? "";
}

/**
 * Parse a JSON response from AI, with fallback.
 */
export function parseAiJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.error("Failed to parse AI JSON response:", raw.slice(0, 200));
    return fallback;
  }
}
