// ============================================================
// Reports Client Component
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Report {
  id: string;
  type: string;
  title: string;
  status: string;
  periodYear: number | null;
  periodMonth: number | null;
  fileUrl: string | null;
  createdAt: string;
}

const REPORT_TYPES = [
  {
    type: "MONTHLY_SUMMARY",
    title: "Monthly Summary",
    description:
      "A concise overview of your financial performance for a given month, including key metrics, trends, and highlights.",
  },
  {
    type: "BOARD_PACK",
    title: "Board Pack",
    description:
      "Comprehensive board-ready report with executive summary, financials, KPIs, risks, and strategic updates.",
  },
  {
    type: "INVESTOR_UPDATE",
    title: "Investor Update",
    description:
      "Structured investor update covering progress, metrics, asks, and upcoming milestones.",
  },
  {
    type: "HEALTH_ASSESSMENT",
    title: "Health Assessment",
    description:
      "Full financial health assessment with scoring breakdown and improvement recommendations.",
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function ReportsClient({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: REPORT_TYPES.find((r) => r.type === type)?.title ?? type,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(null);
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    GENERATING: "bg-blue-100 text-blue-700",
    COMPLETE: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <div className="grid gap-4 md:grid-cols-2">
        {REPORT_TYPES.map((rt) => (
          <div
            key={rt.type}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900">{rt.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{rt.description}</p>
            <button
              onClick={() => handleGenerate(rt.type)}
              disabled={generating !== null}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {generating === rt.type ? "Generating..." : "Generate"}
            </button>
          </div>
        ))}
      </div>

      {/* Existing Reports */}
      {reports.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Generated Reports</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.type.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.periodYear && r.periodMonth
                      ? `${MONTHS[r.periodMonth - 1]} ${r.periodYear}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        statusColors[r.status] ?? ""
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
