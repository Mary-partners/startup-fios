// ============================================================
// /api/financials — CRUD for financial periods
// Authenticated, company-scoped.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import { financialPeriodSchema } from "@/lib/validators/financials";
import type { ApiResponse } from "@/types/api";

// GET: List financial periods for the current company
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    requirePermission(tenant.role, "financials:read");

    const periods = await db.financialPeriod.findMany({
      where: { companyId: tenant.companyId },
      include: {
        revenueRecords: true,
        expenseRecords: true,
        cashBalance: true,
        cogsRecord: true,
        customerConcentration: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({ success: true, data: periods });
  } catch (error: any) {
    console.error("GET /api/financials error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal error" },
      { status: error.message?.includes("permissions") ? 403 : 500 }
    );
  }
}

// POST: Create a new financial period with line items
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ periodId: string }>>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    requirePermission(tenant.role, "financials:write");

    const body = await request.json();
    const parsed = financialPeriodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Compute totals
    const totalRevenue = data.revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCogs = data.cogs ?? 0;
    const netIncome = totalRevenue - totalExpenses;

    const period = await db.financialPeriod.create({
      data: {
        companyId: tenant.companyId,
        year: data.year,
        month: data.month,
        totalRevenue,
        totalExpenses,
        totalCogs,
        netIncome,
        revenueRecords: {
          create: data.revenues.map((r) => ({
            source: r.source,
            amount: r.amount,
            isRecurring: r.isRecurring,
            customerName: r.customerName,
          })),
        },
        expenseRecords: {
          create: data.expenses.map((e) => ({
            category: e.category,
            description: e.description,
            amount: e.amount,
            isFixed: e.isFixed,
          })),
        },
        cashBalance: {
          create: {
            openingBalance: data.cashBalance.opening,
            closingBalance: data.cashBalance.closing,
          },
        },
        ...(data.cogs !== undefined && {
          cogsRecord: {
            create: { amount: data.cogs },
          },
        }),
        ...(data.largestCustomerShare !== undefined && {
          customerConcentration: {
            create: {
              largestCustomerShare: data.largestCustomerShare,
              topThreeCustomerShare: data.topThreeCustomerShare,
              totalCustomerCount: data.totalCustomerCount,
            },
          },
        }),
      },
    });

    // TODO: Trigger background job for alert re-evaluation and AI commentary

    return NextResponse.json({
      success: true,
      data: { periodId: period.id },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "A financial period for this month already exists.",
        },
        { status: 409 }
      );
    }
    console.error("POST /api/financials error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
