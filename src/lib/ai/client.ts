// ============================================================
// AI Provider Client
// Supports OpenAI and Anthropic (Claude) APIs.
// ============================================================

import OpenAI from "openai";

// Lazy-initialized OpenAI client.
// We must NOT create the instance at module load time because it can
// throw or behave unexpectedly when the API key is empty, which breaks
// `next build` during the static page-collection phase.
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY is not set. AI operations are unavailable."
      );
    }
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

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

  const response = await getOpenAI().chat.completions.create({
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
