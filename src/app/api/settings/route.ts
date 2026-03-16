// ============================================================
// API: Settings — Get company profile, team, and subscription
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";

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

    const [company, team, subscription] = await Promise.all([
      db.company.findUnique({
        where: { id: tenant.companyId },
        select: {
          id: true,
          name: true,
          stage: true,
          industry: true,
          website: true,
          foundedYear: true,
          country: true,
        },
      }),
      db.membership.findMany({
        where: { companyId: tenant.companyId },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.subscription.findUnique({
        where: { companyId: tenant.companyId },
        select: {
          tier: true,
          status: true,
          currentPeriodEnd: true,
          stripeCustomerId: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { company, team, subscription },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
