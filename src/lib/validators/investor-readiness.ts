// ============================================================
// Zod Schemas — Investor Readiness Assessment
// ============================================================

import { z } from "zod";

const readinessCategoryEnum = z.enum([
  "reporting",
  "controls",
  "cap_table",
  "kpi_clarity",
  "governance",
  "forecasting",
  "due_diligence",
]);

const readinessAnswerSchema = z.object({
  questionId: z.string().min(1),
  category: readinessCategoryEnum,
  answer: z.number().int().min(1, "Answer must be 1-5").max(5, "Answer must be 1-5"),
  notes: z.string().optional(),
});

export const submitReadinessSchema = z.object({
  answers: z
    .array(readinessAnswerSchema)
    .min(1, "At least one answer is required"),
});

export type SubmitReadinessFormData = z.infer<typeof submitReadinessSchema>;
