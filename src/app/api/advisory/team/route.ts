// ============================================================
// API: Advisory Team — List users with advisory roles
// Used for task assignment dropdowns
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import { Role } from "@/types/enums";

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
    const advisoryRoles = [Role.ADVISOR, Role.HEAD_OF_ADVISORY, Role.ADMIN];

    const memberships = await db.membership.findMany({
      where: {
        role: { in: advisoryRoles },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      distinct: ["userId"],
    });

    const team = memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));

    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch team";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
