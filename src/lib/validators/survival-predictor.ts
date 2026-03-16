// ============================================================
// Zod Schemas — Survival Predictor
// ============================================================

import { z } from "zod";

export const survivalPredictorSchema = z.object({
  cashBalance: z
    .number({ required_error: "Cash balance is required" })
    .min(0, "Cash balance cannot be negative"),
  monthlyRevenue: z
    .number({ required_error: "Monthly revenue is required" })
    .min(0, "Revenue cannot be negative"),
  previousMonthRevenue: z
    .number({ required_error: "Previous month revenue is required" })
    .min(0, "Revenue cannot be negative"),
  monthlyExpenses: z
    .number({ required_error: "Monthly expenses are required" })
    .min(0, "Expenses cannot be negative"),
  cogs: z.number().min(0, "COGS cannot be negative").default(0),
  largestCustomerShare: z
    .number()
    .min(0, "Must be between 0 and 1")
    .max(1, "Must be between 0 and 1")
    .default(0),
  plannedHiresImpact: z
    .number()
    .min(0, "Impact cannot be negative")
    .optional(),
  // Optional lead capture — persisted to the Lead table for follow-up
  email: z.string().email("Please enter a valid email").optional(),
});

export type SurvivalPredictorFormData = z.infer<typeof survivalPredictorSchema>;

export const leadCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(1, "Name is required").optional(),
  companyName: z.string().optional(),
});

export type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;
