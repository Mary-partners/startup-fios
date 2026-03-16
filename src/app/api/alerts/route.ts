// ============================================================
// API: Alerts — List active and dismissed alerts
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";

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

    requirePermission(tenant.role, "alerts:read");

    const alerts = await db.alert.findMany({
      where: { companyId: tenant.companyId },
      orderBy: [{ isDismissed: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: alerts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch alerts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
