// ============================================================
// AI Commentary Orchestrator
// Pipeline: Deterministic Calculation → AI Narrative Generation
// ============================================================

import type { CommentaryRequest, CommentaryResponse } from "@/types/domain";
import { SYSTEM_PROMPT, buildCommentaryPrompt } from "./prompts";
import { aiCompletion, parseAiJson } from "./client";

const FALLBACK_COMMENTARY: CommentaryResponse = {
  executiveSummary:
    "Financial commentary is temporarily unavailable. Please review the calculated metrics directly.",
  keyFindings: ["Review the survival score and metric breakdown above."],
  risks: ["Unable to generate AI risk analysis at this time."],
  recommendations: [
    "Continue monitoring your core metrics and runway closely.",
  ],
  outlook: "Please try generating commentary again later.",
};

/**
 * Generate AI-powered financial commentary.
 * IMPORTANT: All numerical metrics must be computed BEFORE calling this function.
 * The AI only generates narrative — it does not perform calculations.
 */
export async function generateCommentary(
  request: CommentaryRequest
): Promise<CommentaryResponse> {
  try {
    const userPrompt = buildCommentaryPrompt(request);

    const raw = await aiCompletion({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: "gpt-4o",
      temperature: 0.3,
      maxTokens: 1500,
      responseFormat: "json",
    });

    return parseAiJson<CommentaryResponse>(raw, FALLBACK_COMMENTARY);
  } catch (error) {
    console.error("AI commentary generation failed:", error);
    return FALLBACK_COMMENTARY;
  }
}
