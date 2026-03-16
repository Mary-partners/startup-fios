// ============================================================
// API: Dismiss all active alerts for a company
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";

export async function PATCH() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    requirePermission(tenant.role, "alerts:dismiss");

    await db.alert.updateMany({
      where: { companyId: tenant.companyId, isDismissed: false },
      data: { isDismissed: true, dismissedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dismiss alerts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
