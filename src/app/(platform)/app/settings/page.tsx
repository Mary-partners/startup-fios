// ============================================================
// Settings Page — Refactored with MetricCard + feedback messages
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/auth/use-user";
import MetricCard from "@/components/dashboard/metric-card";

interface CompanyProfile {
  id: string;
  name: string;
  stage: string;
  industry: string | null;
  website: string | null;
  foundedYear: number | null;
  country: string | null;
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: { name: string | null; email: string };
  createdAt: string;
}

interface SubscriptionInfo {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

const STAGES = [
  "PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "SERIES_C", "GROWTH", "PROFITABLE",
];

const ROLES = [
  { value: "OWNER", label: "Owner" },
  { value: "FINANCE_MANAGER", label: "Finance Manager" },
  { value: "TEAM_MEMBER", label: "Team Member" },
  { value: "INVESTOR_VIEWER", label: "Investor Viewer" },
];

const TIER_LABELS: Record<string, { label: string; description: string }> = {
  FREE: { label: "Free", description: "Basic dashboard and survival predictor" },
  STARTER: { label: "Starter — $49/mo", description: "Full dashboard, alerts, and reports" },
  GROWTH: { label: "Growth — $149/mo", description: "AI insights, investor readiness, team access" },
  ENTERPRISE: { label: "Enterprise — Custom", description: "Advisory command center, unlimited seats" },
};

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"company" | "team" | "billing">("company");
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TEAM_MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editable company fields
  const [editName, setEditName] = useState("");
  const [editStage, setEditStage] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editCountry, setEditCountry] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setCompany(data.data.company);
        setTeam(data.data.team);
        setSubscription(data.data.subscription);
        setEditName(data.data.company.name);
        setEditStage(data.data.company.stage);
        setEditIndustry(data.data.company.industry ?? "");
        setEditWebsite(data.data.company.website ?? "");
        setEditCountry(data.data.company.country ?? "");
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          stage: editStage,
          industry: editIndustry || null,
          website: editWebsite || null,
          country: editCountry || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCompany(data.data);
        setSaveMsg({ type: "success", text: "Company profile saved" });
      } else {
        setSaveMsg({ type: "error", text: data.error ?? "Failed to save" });
      }
    } catch (err) {
      console.error("Failed to save company:", err);
      setSaveMsg({ type: "error", text: "Network error — please try again" });
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/settings/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteEmail("");
        setInviteMsg({ type: "success", text: `Invitation sent to ${inviteEmail}` });
        fetchSettings();
      } else {
        setInviteMsg({ type: "error", text: data.error ?? "Failed to invite" });
      }
    } catch (err) {
      console.error("Failed to invite member:", err);
      setInviteMsg({ type: "error", text: "Network error — please try again" });
    } finally {
      setInviting(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to open billing portal:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    );
  }

  const tierInfo = TIER_LABELS[subscription?.tier ?? "FREE"] ?? TIER_LABELS.FREE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your company profile, team, and subscription
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(["company", "team", "billing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {tab === "team" && team.length > 0 ? ` (${team.length})` : ""}
          </button>
        ))}
      </div>

      {/* ─────── Company Profile Tab ─────── */}
      {activeTab === "company" && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Company Profile</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Company Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Stage</label>
              <select
                value={editStage}
                onChange={(e) => setEditStage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Industry</label>
              <input
                type="text"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                placeholder="e.g., FinTech, HealthTech"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Website</label>
              <input
                type="url"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Country</label>
              <input
                type="text"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                placeholder="e.g., United States"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saveMsg && (
              <span
                className={`text-sm font-medium ${
                  saveMsg.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {saveMsg.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─────── Team Tab ─────── */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Invite Form */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Invite Team Member</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {inviting ? "Inviting..." : "Invite"}
              </button>
            </div>
            {inviteMsg && (
              <p
                className={`mt-3 text-sm font-medium ${
                  inviteMsg.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {inviteMsg.text}
              </p>
            )}
          </div>

          {/* Team List */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Team Members ({team.length})</h2>
            </div>
            {team.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No team members yet — invite your first teammate above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {m.user.name ?? m.user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {m.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─────── Billing Tab ─────── */}
      {activeTab === "billing" && subscription && (
        <div className="space-y-6">
          {/* Subscription Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Current Plan"
              value={tierInfo.label}
              subtitle={tierInfo.description}
              highlight={subscription.tier === "FREE" ? "default" : "success"}
            />
            <MetricCard
              title="Status"
              value={subscription.status}
              highlight={
                subscription.status === "ACTIVE"
                  ? "success"
                  : subscription.status === "TRIALING"
                  ? "info"
                  : "default"
              }
            />
            <MetricCard
              title="Next Billing"
              value={
                subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "—"
              }
            />
          </div>

          {/* Actions */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Billing Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              {subscription.tier === "FREE"
                ? "Upgrade to unlock alerts, reports, AI insights, and team collaboration."
                : "Manage your payment method, view invoices, or change your plan through the billing portal."}
            </p>
            <div className="mt-4 flex gap-3">
              {subscription.tier !== "FREE" && (
                <button
                  onClick={handleManageBilling}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Manage Billing
                </button>
              )}
              {subscription.tier === "FREE" && (
                <a
                  href="/pricing"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Upgrade Plan
                </a>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user?.primaryEmailAddress?.emailAddress ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user?.fullName ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
