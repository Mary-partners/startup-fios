// ============================================================
// Zod Schemas — Onboarding & Company Setup
// ============================================================

import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  industry: z.string().optional(),
  stage: z.enum([
    "pre-seed",
    "seed",
    "series-a",
    "series-b",
    "series-c",
    "growth",
    "other",
  ]).optional(),
  foundedYear: z.number().int().min(1900).max(2100).optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type CreateCompanyFormData = z.infer<typeof createCompanySchema>;

export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  role: z.enum([
    "FINANCE_MANAGER",
    "TEAM_MEMBER",
    "INVESTOR_VIEWER",
  ]),
});

export type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;
