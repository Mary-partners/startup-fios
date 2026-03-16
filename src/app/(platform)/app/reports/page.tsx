// ============================================================
// Reports Page — Server component: fetch reports, render
// summary + client-side generation interface
// ============================================================

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import MetricCard from "@/components/dashboard/metric-card";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tenant = await resolveTenantContext(userId);
  if (!tenant) redirect("/app/onboarding");

  const reports = await db.report.findMany({
    where: { companyId: tenant.companyId },
    orderBy: { createdAt: "desc" },
  });

  const completed = reports.filter((r) => r.status === "COMPLETE").length;
  const generating = reports.filter((r) => r.status === "GENERATING").length;
  const failed = reports.filter((r) => r.status === "FAILED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate monthly summaries, board packs, investor updates, and health
          assessments powered by your financial data + AI narrative.
        </p>
      </div>

      {/* Summary Row */}
      {reports.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total Reports" value={reports.length} highlight="default" />
          <MetricCard
            title="Completed"
            value={completed}
            highlight="success"
            badge={generating > 0 ? { text: `${generating} generating`, color: "blue" } : undefined}
          />
          {failed > 0 && (
            <MetricCard
              title="Failed"
              value={failed}
              highlight="danger"
              subtitle="Re-generate to retry"
            />
          )}
        </div>
      )}

      <ReportsClient reports={JSON.parse(JSON.stringify(reports))} />
    </div>
  );
}
