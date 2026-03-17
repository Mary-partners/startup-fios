"use client";

// ============================================================
// OnboardClientForm - Multi-section form to onboard a new
// advisory client for CFO Innovation Partners
// Creates company, contact, engagement, and advisory case
// ============================================================

import { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Building2,
  User,
  Briefcase,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface ServicePackage {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface FormState {
  // Section 1: Company Information
  companyName: string;
  industry: string;
  stage: string;
  country: string;
  websiteUrl: string;
  foundedYear: string;
  // Section 2: Primary Contact
  contactName: string;
  contactEmail: string;
  phoneNumber: string;
  contactRole: string;
  // Section 3: Engagement Details
  servicePackageId: string;
  retainerAmount: string;
  billingCadence: string;
  contractStartDate: string;
  contractEndDate: string;
  estimatedHoursPerMonth: string;
  // Section 4: Assigned Team
  leadAdvisorId: string;
  secondaryAdvisorId: string;
  // Section 5: Initial Notes
  keyObjectives: string;
  knownChallenges: string;
  specialRequirements: string;
}

const INDUSTRIES = [
  "FinTech",
  "HealthTech",
  "AgriTech",
  "EdTech",
  "E-Commerce",
  "SaaS",
  "Logistics",
  "Real Estate",
  "Other",
];

const STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Growth",
  "Profitable",
];

const BILLING_CADENCES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "PROJECT", label: "Project-based" },
];

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

const INITIAL_FORM: FormState = {
  companyName: "",
  industry: "",
  stage: "",
  country: "Kenya",
  websiteUrl: "",
  foundedYear: "",
  contactName: "",
  contactEmail: "",
  phoneNumber: "",
  contactRole: "",
  servicePackageId: "",
  retainerAmount: "",
  billingCadence: "MONTHLY",
  contractStartDate: todayISO(),
  contractEndDate: "",
  estimatedHoursPerMonth: "",
  leadAdvisorId: "",
  secondaryAdvisorId: "",
  keyObjectives: "",
  knownChallenges: "",
  specialRequirements: "",
};

const inputClasses =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const selectClasses =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const labelClasses = "block text-sm font-medium text-slate-700";

const textareaClasses =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function OnboardClientForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCaseId, setSuccessCaseId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/advisory/service-packages");
        if (!res.ok) throw new Error("Failed to load service packages");
        const json = await res.json();
        setPackages(json.data || []);
      } catch {
        // User can still fill the form without packages
      } finally {
        setLoadingPackages(false);
      }
    }

    async function fetchTeam() {
      try {
        const res = await fetch("/api/advisory/team");
        if (!res.ok) throw new Error("Failed to load team members");
        const json = await res.json();
        const team = json.data || json.members || [];
        setTeamMembers(Array.isArray(team) ? team : []);
      } catch {
        // User can still fill the form without team list
      } finally {
        setLoadingTeam(false);
      }
    }

    fetchPackages();
    fetchTeam();
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
        // Company
        companyName: form.companyName,
        industry: form.industry || null,
        stage: form.stage || null,
        country: form.country || "Kenya",
        website: form.websiteUrl || null,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : null,
        // Contact (field names must match API handler)
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.phoneNumber || null,
        contactRole: form.contactRole || null,
        // Engagement
        servicePackageId: form.servicePackageId || null,
        retainerAmount: form.retainerAmount ? parseFloat(form.retainerAmount) : null,
        billingCadence: form.billingCadence,
        contractStartDate: form.contractStartDate || null,
        contractEndDate: form.contractEndDate || null,
        estimatedHoursPerMonth: form.estimatedHoursPerMonth
          ? parseFloat(form.estimatedHoursPerMonth)
          : null,
        // Team (API expects leadAdvisor / secondaryAdvisor)
        leadAdvisor: form.leadAdvisorId || null,
        secondaryAdvisor: form.secondaryAdvisorId || null,
        // Notes (API expects objectives / challenges / specialRequirements)
        objectives: form.keyObjectives || null,
        challenges: form.knownChallenges || null,
        specialRequirements: form.specialRequirements || null,
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
      const caseData = result.data || result;
      setSuccessCaseId(caseData.caseId || caseData.id);
      setForm({ ...INITIAL_FORM, contractStartDate: todayISO() });
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
        <div className="flex flex-col items-center py-10 text-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Client onboarded successfully
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            The advisory case has been created. You can now assign deliverables,
            schedule meetings, and start tracking this engagement.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href={`/advisory/startups/${successCaseId}`}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View Client
            </Link>
            <button
              onClick={() => setSuccessCaseId(null)}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Onboard Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Onboard New Advisory Client
            </h2>
            <p className="text-sm text-slate-500">
              Fill in the details below to create a new advisory engagement
            </p>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Section 1: Company Information */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b pb-4">
          <Building2 className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Company Information
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Company Name */}
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className={labelClasses}>
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Savannah Analytics Ltd"
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className={labelClasses}>
              Industry
            </label>
            <select
              id="industry"
              value={form.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              className={selectClasses}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label htmlFor="stage" className={labelClasses}>
              Stage
            </label>
            <select
              id="stage"
              value={form.stage}
              onChange={(e) => updateField("stage", e.target.value)}
              className={selectClasses}
            >
              <option value="">Select stage</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className={labelClasses}>
              Country
            </label>
            <input
              id="country"
              type="text"
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              className={inputClasses}
              placeholder="Kenya"
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className={labelClasses}>
              Website URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={form.websiteUrl}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              className={inputClasses}
              placeholder="https://example.com"
            />
          </div>

          {/* Founded Year */}
          <div>
            <label htmlFor="foundedYear" className={labelClasses}>
              Founded Year
            </label>
            <input
              id="foundedYear"
              type="number"
              min="1900"
              max="2099"
              value={form.foundedYear}
              onChange={(e) => updateField("foundedYear", e.target.value)}
              className={inputClasses}
              placeholder="2024"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Primary Contact */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b pb-4">
          <User className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Primary Contact
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Contact Name */}
          <div>
            <label htmlFor="contactName" className={labelClasses}>
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contactName"
              type="text"
              required
              value={form.contactName}
              onChange={(e) => updateField("contactName", e.target.value)}
              className={inputClasses}
              placeholder="Jane Mwangi"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className={labelClasses}>
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              required
              value={form.contactEmail}
              onChange={(e) => updateField("contactEmail", e.target.value)}
              className={inputClasses}
              placeholder="jane@company.co.ke"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className={labelClasses}>
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              className={inputClasses}
              placeholder="+254 7XX XXX XXX"
            />
          </div>

          {/* Role / Title */}
          <div>
            <label htmlFor="contactRole" className={labelClasses}>
              Role / Title
            </label>
            <input
              id="contactRole"
              type="text"
              value={form.contactRole}
              onChange={(e) => updateField("contactRole", e.target.value)}
              className={inputClasses}
              placeholder="e.g. CEO, Co-Founder"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Engagement Details */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b pb-4">
          <Briefcase className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Engagement Details
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Service Package */}
          <div>
            <label htmlFor="servicePackage" className={labelClasses}>
              Service Package
            </label>
            {loadingPackages ? (
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading packages...
              </div>
            ) : (
              <select
                id="servicePackage"
                value={form.servicePackageId}
                onChange={(e) => updateField("servicePackageId", e.target.value)}
                className={selectClasses}
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

          {/* Retainer Amount */}
          <div>
            <label htmlFor="retainerAmount" className={labelClasses}>
              Retainer Amount (KES) <span className="text-red-500">*</span>
            </label>
            <input
              id="retainerAmount"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.retainerAmount}
              onChange={(e) => updateField("retainerAmount", e.target.value)}
              className={inputClasses}
              placeholder="150000"
            />
          </div>

          {/* Billing Cadence */}
          <div>
            <label htmlFor="billingCadence" className={labelClasses}>
              Billing Cadence
            </label>
            <select
              id="billingCadence"
              value={form.billingCadence}
              onChange={(e) => updateField("billingCadence", e.target.value)}
              className={selectClasses}
            >
              {BILLING_CADENCES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estimated Hours */}
          <div>
            <label htmlFor="estimatedHours" className={labelClasses}>
              Estimated Hours / Month
            </label>
            <input
              id="estimatedHours"
              type="number"
              min="0"
              step="0.5"
              value={form.estimatedHoursPerMonth}
              onChange={(e) => updateField("estimatedHoursPerMonth", e.target.value)}
              className={inputClasses}
              placeholder="20"
            />
          </div>

          {/* Contract Start Date */}
          <div>
            <label htmlFor="contractStart" className={labelClasses}>
              Contract Start Date
            </label>
            <input
              id="contractStart"
              type="date"
              value={form.contractStartDate}
              onChange={(e) => updateField("contractStartDate", e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Contract End Date */}
          <div>
            <label htmlFor="contractEnd" className={labelClasses}>
              Contract End Date
            </label>
            <input
              id="contractEnd"
              type="date"
              value={form.contractEndDate}
              onChange={(e) => updateField("contractEndDate", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Assigned Team */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b pb-4">
          <Users className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Assigned Team
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Lead Advisor */}
          <div>
            <label htmlFor="leadAdvisor" className={labelClasses}>
              Lead Advisor
            </label>
            {loadingTeam ? (
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading team...
              </div>
            ) : (
              <select
                id="leadAdvisor"
                value={form.leadAdvisorId}
                onChange={(e) => updateField("leadAdvisorId", e.target.value)}
                className={selectClasses}
              >
                <option value="">Select lead advisor</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.email}
                    {m.role ? ` (${m.role})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Secondary Advisor */}
          <div>
            <label htmlFor="secondaryAdvisor" className={labelClasses}>
              Secondary Advisor (optional)
            </label>
            {loadingTeam ? (
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading team...
              </div>
            ) : (
              <select
                id="secondaryAdvisor"
                value={form.secondaryAdvisorId}
                onChange={(e) => updateField("secondaryAdvisorId", e.target.value)}
                className={selectClasses}
              >
                <option value="">None</option>
                {teamMembers
                  .filter((m) => m.id !== form.leadAdvisorId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                      {m.role ? ` (${m.role})` : ""}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Initial Notes */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b pb-4">
          <FileText className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Initial Notes
          </h3>
        </div>

        <div className="grid gap-5">
          {/* Key Objectives */}
          <div>
            <label htmlFor="keyObjectives" className={labelClasses}>
              Key Objectives
            </label>
            <p className="mb-1 text-xs text-slate-400">
              What does the client want to achieve with CFO advisory services?
            </p>
            <textarea
              id="keyObjectives"
              rows={3}
              value={form.keyObjectives}
              onChange={(e) => updateField("keyObjectives", e.target.value)}
              className={textareaClasses}
              placeholder="e.g. Prepare for Series A fundraise, implement financial controls, monthly reporting..."
            />
          </div>

          {/* Known Challenges */}
          <div>
            <label htmlFor="knownChallenges" className={labelClasses}>
              Known Challenges
            </label>
            <p className="mb-1 text-xs text-slate-400">
              Any red flags or urgent issues to be aware of?
            </p>
            <textarea
              id="knownChallenges"
              rows={3}
              value={form.knownChallenges}
              onChange={(e) => updateField("knownChallenges", e.target.value)}
              className={textareaClasses}
              placeholder="e.g. Cash flow issues, missing tax filings, no bookkeeping system..."
            />
          </div>

          {/* Special Requirements */}
          <div>
            <label htmlFor="specialRequirements" className={labelClasses}>
              Special Requirements
            </label>
            <p className="mb-1 text-xs text-slate-400">
              Any specific tools, reporting formats, or compliance requirements?
            </p>
            <textarea
              id="specialRequirements"
              rows={3}
              value={form.specialRequirements}
              onChange={(e) => updateField("specialRequirements", e.target.value)}
              className={textareaClasses}
              placeholder="e.g. QuickBooks integration, investor-specific reporting, KRA compliance..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/advisory"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
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
