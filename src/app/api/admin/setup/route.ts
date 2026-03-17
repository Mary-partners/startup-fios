// ============================================================
// POST /api/admin/setup - Account creation for the firm
// Creates team accounts under CFO Innovation Partners.
// Protected by a setup secret to prevent unauthorized use.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";

const SETUP_SECRET = "cfoip-setup-2026";

const VALID_ROLES = [
  "OWNER",
  "FINANCE_MANAGER",
  "TEAM_MEMBER",
  "INVESTOR_VIEWER",
  "ADVISOR",
  "HEAD_OF_ADVISORY",
  "ADMIN",
];

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
    const name = body.name || "Team Member";
    const role = body.role || "ADMIN";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Use: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create or update user
    const user = await db.user.upsert({
      where: { email },
      update: { passwordHash, name },
      create: {
        email,
        name,
        externalId: `team_${Date.now()}`,
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

    // Create membership with specified role
    await db.membership.upsert({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
      update: { role: role as never },
      create: {
        userId: user.id,
        companyId: company.id,
        role: role as never,
      },
    });

    // Ensure enterprise subscription exists
    await db.subscription.upsert({
      where: { companyId: company.id },
      update: {},
      create: {
        companyId: company.id,
        tier: "ENTERPRISE",
        status: "ACTIVE",
      },
    });

    console.log(`[admin-setup] Account created: ${email} with role ${role}`);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        companyId: company.id,
        role,
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
