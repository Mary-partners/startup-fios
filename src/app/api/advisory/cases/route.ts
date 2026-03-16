// ============================================================
// API: Advisory Cases — List all advisory cases with scores
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

    const cases = await db.advisoryCase.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            stage: true,
          },
        },
        tasks: {
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Return enriched cases with task counts
    const data = cases.map((c) => ({
      id: c.id,
      company: c.company,
      priority: c.priority,
      status: c.status,
      openTasks: c.tasks.length,
      nextReviewDate: c.nextReviewDate?.toISOString() ?? null,
      lastReviewedAt: c.lastReviewedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch cases";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
