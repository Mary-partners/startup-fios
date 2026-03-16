// ============================================================
// App-wide Constants
// ============================================================

export const APP_NAME = "Startup Financial Intelligence OS";
export const APP_SHORT_NAME = "CFOIP Financial OS";
export const COMPANY_NAME = "CFO Innovation Partners";
export const SUPPORT_EMAIL = "partner@cfopartners.fund";
export const SUPPORT_PHONE = "+254748918910";

export const EXPENSE_CATEGORIES = [
  "Payroll & Benefits",
  "Rent & Facilities",
  "Software & Tools",
  "Marketing & Advertising",
  "Professional Services",
  "Travel & Entertainment",
  "Insurance",
  "R&D / Engineering",
  "Customer Support",
  "General & Administrative",
  "Other",
] as const;

export const REVENUE_SOURCES = [
  "SaaS MRR",
  "Annual Contracts",
  "Consulting / Services",
  "One-time License",
  "Usage-based",
  "Other",
] as const;

export const STARTUP_STAGES = [
  { value: "pre-seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "series-c", label: "Series C" },
  { value: "growth", label: "Growth" },
  { value: "other", label: "Other" },
] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
