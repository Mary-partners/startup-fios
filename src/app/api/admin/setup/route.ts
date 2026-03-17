// ============================================================
// POST /api/admin/setup - One-time admin account creation
// Creates the CFO Innovation Partners admin account.
// Protected by a setup secret to prevent unauthorized use.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";

const SETUP_SECRET = "cfoip-setup-2026";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify setup secret
    if (body.secret !== SETUP_SECRET) {
      return NextResponse.json(
        { success: false, error: "Invalid setup secret" },
        { status: 403 }
      );
    }

    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const name = body.name || "Admin";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create or update admin user
    const user = await db.user.upsert({
      where: { email },
      update: { passwordHash, name },
      create: {
        email,
        name,
        externalId: `admin_${Date.now()}`,
        passwordHash,
      },
    });

    // Create or find the firm company
    const company = await db.company.upsert({
      where: { slug: "cfo-innovation-partners" },
      update: {},
      create: {
        name: "CFO Innovation Partners",
        slug: "cfo-innovation-partners",
        industry: "Financial Advisory",
        stage: "GROWTH",
        foundedYear: 2024,
        website: "https://www.cfopartners.fund",
        country: "Kenya",
      },
    });

    // Create ADMIN membership
    await db.membership.upsert({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
      update: { role: "ADMIN" },
      create: {
        userId: user.id,
        companyId: company.id,
        role: "ADMIN",
      },
    });

    // Create enterprise subscription
    await db.subscription.upsert({
      where: { companyId: company.id },
      update: {},
      create: {
        companyId: company.id,
        tier: "ENTERPRISE",
        status: "ACTIVE",
      },
    });

    console.log(`[admin-setup] Admin account created: ${email}`);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        companyId: company.id,
        role: "ADMIN",
      },
    });
  } catch (error) {
    console.error("[admin-setup] Error:", error);
    return NextResponse.json(
      { success: false, error: "Setup failed" },
      { status: 500 }
    );
  }
}
