"use client";

// ============================================================
// OnboardClientForm - Form to onboard a new advisory client
// Creates company, membership, and advisory case in one request
// ============================================================

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";

interface ServicePackage {
  id: string;
  name: string;
}

interface FormState {
  companyName: string;
  email: string;
  servicePackageId: string;
  retainerAmount: string;
  billingCadence: string;
  contractStartDate: string;
  contractEndDate: string;
  estimatedHoursPerMonth: string;
  notes: string;
}

const BILLING_CADENCES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "PROJECT", label: "Project-based" },
];

const INITIAL_FORM: FormState = {
  companyName: "",
  email: "",
  servicePackageId: "",
  retainerAmount: "",
  billingCadence: "MONTHLY",
  contractStartDate: "",
  contractEndDate: "",
  estimatedHoursPerMonth: "",
  notes: "",
};

export function OnboardClientForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCaseId, setSuccessCaseId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/advisory/service-packages");
        if (!res.ok) throw new Error("Failed to load service packages");
        const data = await res.json();
        setPackages(data);
      } catch {
        // Silently handle; user can still fill the form without packages
      } finally {
        setLoadingPackages(false);
      }
    }
    fetchPackages();
  }, []);

  function updateField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const body = {
        companyName: form.companyName,
        email: form.email,
        servicePackageId: form.servicePackageId || null,
        retainerAmount: form.retainerAmount ? parseFloat(form.retainerAmount) : null,
        billingCadence: form.billingCadence,
        contractStartDate: form.contractStartDate || null,
        contractEndDate: form.contractEndDate || null,
        estimatedHoursPerMonth: form.estimatedHoursPerMonth
          ? parseFloat(form.estimatedHoursPerMonth)
          : null,
        notes: form.notes || null,
      };

      const res = await fetch("/api/advisory/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to onboard client");
      }

      const result = await res.json();
      setSuccessCaseId(result.id || result.caseId);
      setForm(INITIAL_FORM);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (successCaseId) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Client onboarded successfully
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The advisory case has been created and is ready for use.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href={`/admin/advisory/cases/${successCaseId}`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View Client
            </Link>
            <button
              onClick={() => setSuccessCaseId(null)}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Onboard Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 border-b pb-4">
        <UserPlus className="h-5 w-5 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900">
          Onboard New Advisory Client
        </h2>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Company name */}
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            required
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Acme Corp"
          />
        </div>

        {/* Contact email */}
        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="contact@acme.com"
          />
        </div>

        {/* Service package */}
        <div>
          <label htmlFor="servicePackage" className="block text-sm font-medium text-gray-700">
            Service Package
          </label>
          {loadingPackages ? (
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading packages...
            </div>
          ) : (
            <select
              id="servicePackage"
              value={form.servicePackageId}
              onChange={(e) => updateField("servicePackageId", e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Retainer amount */}
        <div>
          <label htmlFor="retainerAmount" className="block text-sm font-medium text-gray-700">
            Retainer Amount (USD)
          </label>
          <input
            id="retainerAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.retainerAmount}
            onChange={(e) => updateField("retainerAmount", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="5000"
          />
        </div>

        {/* Billing cadence */}
        <div>
          <label htmlFor="billingCadence" className="block text-sm font-medium text-gray-700">
            Billing Cadence
          </label>
          <select
            id="billingCadence"
            value={form.billingCadence}
            onChange={(e) => updateField("billingCadence", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {BILLING_CADENCES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Estimated hours per month */}
        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
            Estimated Hours / Month
          </label>
          <input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            value={form.estimatedHoursPerMonth}
            onChange={(e) => updateField("estimatedHoursPerMonth", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="20"
          />
        </div>

        {/* Contract start date */}
        <div>
          <label htmlFor="contractStart" className="block text-sm font-medium text-gray-700">
            Contract Start Date
          </label>
          <input
            id="contractStart"
            type="date"
            value={form.contractStartDate}
            onChange={(e) => updateField("contractStartDate", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Contract end date */}
        <div>
          <label htmlFor="contractEnd" className="block text-sm font-medium text-gray-700">
            Contract End Date
          </label>
          <input
            id="contractEnd"
            type="date"
            value={form.contractEndDate}
            onChange={(e) => updateField("contractEndDate", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Additional notes about this engagement..."
          />
        </div>
      </div>

      {/* Submit */}
      <div className="mt-6 flex justify-end border-t pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Onboard Client
            </>
          )}
        </button>
      </div>
    </form>
  );
}
