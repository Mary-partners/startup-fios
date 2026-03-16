// ============================================================
// API: Update company profile
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    requirePermission(tenant.role, "company:update");

    const body = await request.json();
    const { name, stage, industry, website, country } = body;

    const updated = await db.company.update({
      where: { id: tenant.companyId },
      data: {
        ...(name && { name }),
        ...(stage && { stage }),
        ...(industry !== undefined && { industry }),
        ...(website !== undefined && { website }),
        ...(country !== undefined && { country }),
      },
      select: {
        id: true,
        name: true,
        stage: true,
        industry: true,
        website: true,
        foundedYear: true,
        country: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update company";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
