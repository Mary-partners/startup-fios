// ============================================================
// API: Upcoming Deliverables — Due in next 14 days
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

    const now = new Date();
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(now.getDate() + 14);

    const deliverables = await db.deliverable.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: fourteenDaysFromNow,
        },
      },
      include: {
        advisoryCase: {
          include: {
            company: {
              select: { id: true, name: true, stage: true },
            },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: deliverables });
  } catch (error: unknown) {
    console.error("[advisory/deliverables/upcoming] GET error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch upcoming deliverables";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
