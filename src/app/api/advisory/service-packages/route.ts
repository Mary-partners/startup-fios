// ============================================================
// API: Service Packages — List and create
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import { Role } from "@/types/enums";

// GET /api/advisory/service-packages
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

    const packages = await db.servicePackage.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: packages });
  } catch (error: unknown) {
    console.error("[advisory/service-packages] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch service packages";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/advisory/service-packages
export async function POST(req: NextRequest) {
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

    // Only HEAD_OF_ADVISORY and ADMIN can create packages
    if (
      tenant.role !== Role.HEAD_OF_ADVISORY &&
      tenant.role !== Role.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      monthlyHours,
      deliverables,
      priceAmount,
      priceCadence,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const servicePackage = await db.servicePackage.create({
      data: {
        name,
        description: description ?? null,
        monthlyHours: monthlyHours ?? null,
        deliverables: deliverables ?? [],
        priceAmount: priceAmount ?? null,
        priceCadence: priceCadence ?? "MONTHLY",
      },
    });

    return NextResponse.json({ success: true, data: servicePackage });
  } catch (error: unknown) {
    console.error("[advisory/service-packages] POST error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create service package";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
