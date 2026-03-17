// ============================================================
// API: Cross-Client Activity Feed — Recent activities
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant || !isAdvisoryRole(tenant.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const activities = await db.activityEvent.findMany({
      take: 50,
      include: {
        advisoryCase: {
          include: {
            company: {
              select: { id: true, name: true, stage: true },
            },
          },
        },
        performedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error: unknown) {
    console.error("[advisory/activity/feed] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch activity feed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
