"use client";

// ============================================================
// SurvivalPredictorForm  -  Reusable intake form for the
// public survival predictor. Handles validation, submission,
// and result redirect.
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface SurvivalFormValues {
  cashBalance: string;
  monthlyRevenue: string;
  previousMonthRevenue: string;
  monthlyExpenses: string;
  cogs: string;
  largestCustomerShare: string;
  plannedHiresImpact: string;
  email: string;
}

const INITIAL_VALUES: SurvivalFormValues = {
  cashBalance: "",
  monthlyRevenue: "",
  previousMonthRevenue: "",
  monthlyExpenses: "",
  cogs: "",
  largestCustomerShare: "",
  plannedHiresImpact: "",
  email: "",
};

interface FieldConfig {
  key: keyof SurvivalFormValues;
  label: string;
  placeholder: string;
  required: boolean;
  hint?: string;
  type?: "number" | "email" | "percent";
  min?: number;
  max?: number;
  step?: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: "cashBalance",
    label: "Cash Balance ($)",
    placeholder: "e.g. 500000",
    required: true,
    hint: "Total cash on hand right now",
  },
  {
    key: "monthlyRevenue",
    label: "Monthly Revenue ($)",
    placeholder: "e.g. 25000",
    required: true,
    hint: "This month's total revenue (enter 0 for pre-revenue)",
  },
  {
    key: "previousMonthRevenue",
    label: "Previous Month Revenue ($)",
    placeholder: "e.g. 22000",
    required: true,
    hint: "Last month's total revenue (for growth calculation)",
  },
  {
    key: "monthlyExpenses",
    label: "Monthly Expenses ($)",
    placeholder: "e.g. 40000",
    required: true,
    hint: "Total operating expenses this month",
  },
  {
    key: "cogs",
    label: "Cost of Goods Sold ($)",
    placeholder: "e.g. 5000",
    required: false,
    hint: "Direct costs to deliver your product (optional)",
  },
  {
    key: "largestCustomerShare",
    label: "Largest Customer Revenue Share (%)",
    placeholder: "e.g. 35",
    required: false,
    hint: "What percentage of revenue comes from your largest customer?",
    type: "percent",
    min: 0,
    max: 100,
  },
  {
    key: "plannedHiresImpact",
    label: "Planned Monthly Hire Cost ($)",
    placeholder: "e.g. 8000",
    required: false,
    hint: "Expected additional monthly cost from upcoming hires",
  },
];

export default function SurvivalPredictorForm() {
  const router = useRouter();
  const [values, setValues] = useState<SurvivalFormValues>(INITIAL_VALUES);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof SurvivalFormValues, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    const missing = FIELDS.filter(
      (f) => f.required && !values[f.key].trim()
    ).map((f) => f.label);

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    // Build payload
    const numVal = (k: keyof SurvivalFormValues) => {
      const v = values[k].trim();
      return v ? parseFloat(v) : 0;
    };

    const payload = {
      cashBalance: numVal("cashBalance"),
      monthlyRevenue: numVal("monthlyRevenue"),
      previousMonthRevenue: numVal("previousMonthRevenue"),
      monthlyExpenses: numVal("monthlyExpenses"),
      cogs: numVal("cogs"),
      largestCustomerShare: numVal("largestCustomerShare") / 100, // convert % → decimal
      plannedHiresImpact: numVal("plannedHiresImpact") || undefined,
      email: email.trim() || undefined,
    };

    // Basic sanity
    if (payload.cashBalance <= 0) {
      setError("Cash balance must be greater than zero.");
      return;
    }
    if (payload.monthlyExpenses <= 0) {
      setError("Monthly expenses must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/survival-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Store result for the results page
      sessionStorage.setItem(
        "survivalResult",
        JSON.stringify(data.data)
      );
      router.push("/survival-predictor/results");
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dynamic Fields */}
      {FIELDS.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-slate-700">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>
          <input
            type="number"
            inputMode="decimal"
            step={field.step ?? "any"}
            min={field.min}
            max={field.max}
            value={values[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {field.hint && (
            <p className="mt-1 text-xs text-slate-400">{field.hint}</p>
          )}
        </div>
      ))}

      {/* Optional Email Capture */}
      <div className="border-t border-slate-100 pt-5">
        <label className="block text-sm font-medium text-slate-700">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@startup.com"
          className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-slate-400">
          Get a detailed PDF report emailed to you (no spam, ever)
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition"
      >
        {submitting ? "Calculating..." : "Calculate My Survival Score"}
      </button>
    </form>
  );
}
