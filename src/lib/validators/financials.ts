// ============================================================
// Zod Schemas — Financial Data Input
// ============================================================

import { z } from "zod";

const revenueLineSchema = z.object({
  source: z.string().min(1, "Revenue source is required"),
  amount: z.number().min(0, "Amount cannot be negative"),
  isRecurring: z.boolean().default(false),
  customerName: z.string().optional(),
});

const expenseLineSchema = z.object({
  category: z.string().min(1, "Expense category is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount cannot be negative"),
  isFixed: z.boolean().default(false),
});

const cashBalanceSchema = z.object({
  opening: z.number().min(0, "Opening balance cannot be negative"),
  closing: z.number().min(0, "Closing balance cannot be negative"),
});

export const financialPeriodSchema = z.object({
  year: z
    .number()
    .int()
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Invalid year"),
  month: z.number().int().min(1).max(12),
  revenues: z.array(revenueLineSchema).min(0),
  expenses: z.array(expenseLineSchema).min(0),
  cashBalance: cashBalanceSchema,
  cogs: z.number().min(0).optional(),
  largestCustomerShare: z.number().min(0).max(1).optional(),
  topThreeCustomerShare: z.number().min(0).max(1).optional(),
  totalCustomerCount: z.number().int().min(0).optional(),
});

export type FinancialPeriodFormData = z.infer<typeof financialPeriodSchema>;

// Simplified quick entry form (for manual single-field entry)
export const quickFinancialEntrySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  totalRevenue: z.number().min(0),
  totalExpenses: z.number().min(0),
  cashBalance: z.number().min(0),
  cogs: z.number().min(0).default(0),
  largestCustomerShare: z.number().min(0).max(100).default(0), // Accept as percentage
});

export type QuickFinancialEntryFormData = z.infer<
  typeof quickFinancialEntrySchema
>;
