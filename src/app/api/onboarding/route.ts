// ============================================================
// API: Onboarding — Create company, membership, subscription
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { auth } from "@/lib/auth/server";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { externalId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found. Please try signing up again." },
        { status: 404 }
      );
    }

    // Check if user already has a company
    const existingMembership = await db.membership.findFirst({
      where: { userId: user.id },
    });

    if (existingMembership) {
      return NextResponse.json(
        { success: false, error: "You already belong to a company." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      stage,
      industry,
      website,
      country,
      foundedYear,
      initialFinancials,
    } = body;

    if (!companyName || !stage) {
      return NextResponse.json(
        { success: false, error: "Company name and stage are required." },
        { status: 400 }
      );
    }

    // Generate a unique slug
    let baseSlug = slugify(companyName);
    let slug = baseSlug;
    let attempt = 0;
    while (await db.company.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Create company, membership, subscription, and optional initial financial period
    const result = await db.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          stage,
          industry: industry ?? null,
          website: website ?? null,
          country: country ?? null,
          foundedYear: foundedYear ?? null,
        },
      });

      // 2. Create membership (Owner role)
      await tx.membership.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: "OWNER",
        },
      });

      // 3. Create free subscription
      await tx.subscription.create({
        data: {
          companyId: company.id,
          tier: "FREE",
          status: "ACTIVE",
        },
      });

      // 4. Create initial financial period if data provided
      if (initialFinancials) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const revenue = initialFinancials.monthlyRevenue ?? 0;
        const expenses = initialFinancials.monthlyExpenses ?? 0;
        const cash = initialFinancials.cashBalance ?? 0;

        await tx.financialPeriod.create({
          data: {
            companyId: company.id,
            year,
            month,
            totalRevenue: revenue,
            totalExpenses: expenses,
            totalCogs: 0,
            netIncome: revenue - expenses,
            cashBalance: {
              create: {
                openingBalance: cash,
                closingBalance: cash,
              },
            },
          },
        });
      }

      return company;
    });

    return NextResponse.json({ success: true, data: { companyId: result.id } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Onboarding failed";
    console.error("Onboarding error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
