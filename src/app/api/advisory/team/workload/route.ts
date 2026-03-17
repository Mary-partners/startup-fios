// ============================================================
// API: Team Workload — Aggregate workload per advisor
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

    // Find all users with advisory roles
    const advisoryMembers = await db.membership.findMany({
      where: {
        role: { in: ["ADVISOR", "HEAD_OF_ADVISORY", "ADMIN"] },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Deduplicate by user ID (a user may have multiple memberships)
    const uniqueUsers = new Map<
      string,
      { id: string; name: string | null; email: string }
    >();
    for (const m of advisoryMembers) {
      if (!uniqueUsers.has(m.user.id)) {
        uniqueUsers.set(m.user.id, m.user);
      }
    }

    const now = new Date();
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(now.getDate() + 14);

    const workloadData = await Promise.all(
      Array.from(uniqueUsers.values()).map(async (user) => {
        // Active cases assigned to this user
        const activeCases = await db.advisoryCase.count({
          where: {
            assignedAdvisor: user.id,
            engagementStatus: { in: ["ACTIVE", "ONBOARDING"] },
          },
        });

        // Open tasks assigned to this user
        const openTasks = await db.advisoryTask.count({
          where: {
            assignedToId: user.id,
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
        });

        // Upcoming deliverables assigned to this user (next 14 days)
        const upcomingDeliverables = await db.deliverable.count({
          where: {
            assignedToId: user.id,
            dueDate: {
              gte: now,
              lte: fourteenDaysFromNow,
            },
          },
        });

        // Hours from assigned cases
        const assignedCases = await db.advisoryCase.findMany({
          where: {
            assignedAdvisor: user.id,
            engagementStatus: { in: ["ACTIVE", "ONBOARDING"] },
          },
          select: {
            estimatedHoursPerMonth: true,
            actualHoursThisMonth: true,
          },
        });

        const estimatedHours = assignedCases.reduce(
          (sum, c) => sum + (c.estimatedHoursPerMonth?.toNumber() ?? 0),
          0
        );

        const actualHours = assignedCases.reduce(
          (sum, c) => sum + (c.actualHoursThisMonth?.toNumber() ?? 0),
          0
        );

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          activeCases,
          openTasks,
          upcomingDeliverables,
          estimatedHours,
          actualHours,
        };
      })
    );

    return NextResponse.json({ success: true, data: workloadData });
  } catch (error: unknown) {
    console.error("[advisory/team/workload] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch workload data";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
