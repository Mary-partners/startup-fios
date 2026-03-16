// ============================================================
// BoardPackBuilder  -  Select sections for a board pack report
// ============================================================

"use client";

import { useState } from "react";

const SECTIONS = [
  { id: "executive_summary", label: "Executive Summary", description: "High-level KPIs and narrative", required: true },
  { id: "financials", label: "Financial Overview", description: "Revenue, expenses, cash flow", required: true },
  { id: "burn_runway", label: "Burn & Runway", description: "Net burn rate and runway projection", required: true },
  { id: "health_score", label: "Health Score", description: "6-factor financial health assessment", required: false },
  { id: "growth_metrics", label: "Growth Metrics", description: "MoM growth, MRR trends", required: false },
  { id: "customer_metrics", label: "Customer Metrics", description: "Concentration risk, customer count", required: false },
  { id: "investor_readiness", label: "Investor Readiness", description: "Readiness score and gaps", required: false },
  { id: "risks_actions", label: "Risks & Action Items", description: "Active alerts and next steps", required: true },
] as const;

interface BoardPackBuilderProps {
  onGenerate: (sections: string[]) => Promise<void>;
  loading?: boolean;
}

export default function BoardPackBuilder({ onGenerate, loading = false }: BoardPackBuilderProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(SECTIONS.filter((s) => s.required).map((s) => s.id))
  );

  const toggle = (id: string, required: boolean) => {
    if (required) return; // Can't deselect required
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    await onGenerate(Array.from(selected));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Board Pack Sections</h3>
        <p className="mt-1 text-sm text-slate-500">
          Select which sections to include in your board pack. Required sections cannot be removed.
        </p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const checked = selected.has(section.id);
          return (
            <label
              key={section.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                checked
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              } ${section.required ? "cursor-default" : "cursor-pointer"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(section.id, section.required)}
                disabled={section.required}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <div>
                <span className="text-sm font-medium text-slate-900">
                  {section.label}
                  {section.required && (
                    <span className="ml-1.5 text-xs text-slate-400">(Required)</span>
                  )}
                </span>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
            </label>
          );
        })}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || selected.size === 0}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Generating Board Pack..." : `Generate Board Pack (${selected.size} sections)`}
      </button>
    </div>
  );
}
