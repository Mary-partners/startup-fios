// ============================================================
// API: Reports — List and generate reports
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import { emit } from "@/lib/jobs/inngest";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    requirePermission(tenant.role, "reports:read");

    const reports = await db.report.findMany({
      where: { companyId: tenant.companyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    requirePermission(tenant.role, "reports:create");

    const body = await request.json();
    const { type, title } = body;

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: "Type and title are required" },
        { status: 400 }
      );
    }

    // Determine the period (latest financial period)
    const latestPeriod = await db.financialPeriod.findFirst({
      where: { companyId: tenant.companyId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const report = await db.report.create({
      data: {
        companyId: tenant.companyId,
        type,
        title,
        status: "GENERATING",
        periodYear: latestPeriod?.year ?? null,
        periodMonth: latestPeriod?.month ?? null,
      },
    });

    // Fire background job for report generation
    emit("report/generate", {
      reportId: report.id,
      companyId: tenant.companyId,
      reportType: type,
    }).catch((err) =>
      console.error("Failed to emit report generation event:", err)
    );

    return NextResponse.json({ success: true, data: report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create report";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
