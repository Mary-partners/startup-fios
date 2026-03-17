// ============================================================
// API: Advisory Cases - List and create advisory cases
// Returns enriched case data with engagement, deliverables info
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { isAdvisoryRole } from "@/lib/auth/permissions";
import { hashPassword } from "@/lib/auth/password";
import { logActivity } from "@/lib/advisory/log-activity";

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

    const cases = await db.advisoryCase.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            stage: true,
            industry: true,
            country: true,
          },
        },
        servicePackage: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          select: { id: true },
        },
        deliverables: {
          where: {
            status: { not: "DELIVERED" },
            dueDate: { not: null },
          },
          orderBy: { dueDate: "asc" },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            assignedTo: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Look up advisor names
    const advisorIds = cases
      .map((c) => c.assignedAdvisor)
      .filter(Boolean) as string[];
    const advisors = advisorIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: advisorIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const advisorMap = new Map(advisors.map((a) => [a.id, a]));

    const data = cases.map((c) => {
      const nextDeliverable = c.deliverables[0] ?? null;
      const overdueDeliverables = c.deliverables.filter(
        (d) => d.dueDate && new Date(d.dueDate) < now
      );
      const advisor = c.assignedAdvisor
        ? advisorMap.get(c.assignedAdvisor)
        : null;

      return {
        id: c.id,
        company: c.company,
        priority: c.priority,
        status: c.status,
        engagementStatus: c.engagementStatus,
        assignedAdvisor: c.assignedAdvisor,
        advisorName: advisor?.name ?? null,
        advisorEmail: advisor?.email ?? null,
        servicePackage: c.servicePackage,
        retainerAmount: c.retainerAmount ? Number(c.retainerAmount) : null,
        billingCadence: c.billingCadence,
        contractStartDate: c.contractStartDate?.toISOString() ?? null,
        contractEndDate: c.contractEndDate?.toISOString() ?? null,
        estimatedHoursPerMonth: c.estimatedHoursPerMonth
          ? Number(c.estimatedHoursPerMonth)
          : null,
        actualHoursThisMonth: c.actualHoursThisMonth
          ? Number(c.actualHoursThisMonth)
          : null,
        openTasks: c.tasks.length,
        overdueDeliverables: overdueDeliverables.length,
        upcomingDeliverables: c.deliverables.length,
        nextDeliverable: nextDeliverable
          ? {
              title: nextDeliverable.title,
              dueDate: nextDeliverable.dueDate?.toISOString() ?? null,
              status: nextDeliverable.status,
            }
          : null,
        nextReviewDate: c.nextReviewDate?.toISOString() ?? null,
        lastReviewedAt: c.lastReviewedAt?.toISOString() ?? null,
        onboardedAt: c.onboardedAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
      };
    });

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

// POST - Create a new advisory case (onboard a client)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      companyName,
      industry,
      stage,
      country,
      website,
      foundedYear,
      contactName,
      contactEmail,
      contactPhone,
      contactRole,
      servicePackageId,
      retainerAmount,
      billingCadence,
      contractStartDate,
      contractEndDate,
      estimatedHoursPerMonth,
      leadAdvisor,
      secondaryAdvisor,
      objectives,
      challenges,
      specialRequirements,
    } = body;

    if (!companyName || !contactEmail) {
      return NextResponse.json(
        { success: false, error: "Company name and contact email are required" },
        { status: 400 }
      );
    }

    // Create slug from company name
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + `-${Date.now().toString(36)}`;

    // Create the company
    const company = await db.company.create({
      data: {
        name: companyName,
        slug,
        industry: industry || null,
        stage: stage || null,
        country: country || "Kenya",
        website: website || null,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
      },
    });

    // Create or find the contact user
    const contactPasswordHash = await hashPassword("welcome2026");
    const contactUser = await db.user.upsert({
      where: { email: contactEmail.toLowerCase().trim() },
      update: { name: contactName || undefined },
      create: {
        email: contactEmail.toLowerCase().trim(),
        name: contactName || null,
        externalId: `client_${Date.now()}`,
        passwordHash: contactPasswordHash,
      },
    });

    // Create OWNER membership for the contact
    await db.membership.upsert({
      where: {
        userId_companyId: {
          userId: contactUser.id,
          companyId: company.id,
        },
      },
      update: {},
      create: {
        userId: contactUser.id,
        companyId: company.id,
        role: "OWNER",
      },
    });

    // Create FREE subscription for the client
    await db.subscription.upsert({
      where: { companyId: company.id },
      update: {},
      create: {
        companyId: company.id,
        tier: "FREE",
        status: "ACTIVE",
      },
    });

    // Build notes from objectives, challenges, and requirements
    const notesParts = [];
    if (objectives) notesParts.push(`Objectives: ${objectives}`);
    if (challenges) notesParts.push(`Challenges: ${challenges}`);
    if (specialRequirements) notesParts.push(`Special Requirements: ${specialRequirements}`);
    if (contactPhone) notesParts.push(`Phone: ${contactPhone}`);
    if (contactRole) notesParts.push(`Role: ${contactRole}`);
    if (secondaryAdvisor) notesParts.push(`Secondary Advisor: ${secondaryAdvisor}`);

    // Create the advisory case
    const advisoryCase = await db.advisoryCase.create({
      data: {
        companyId: company.id,
        engagementStatus: "ONBOARDING",
        status: "active",
        priority: "MEDIUM",
        assignedAdvisor: leadAdvisor || null,
        servicePackageId: servicePackageId || null,
        retainerAmount: retainerAmount ? parseFloat(retainerAmount) : null,
        billingCadence: billingCadence || null,
        contractStartDate: contractStartDate
          ? new Date(contractStartDate)
          : new Date(),
        contractEndDate: contractEndDate
          ? new Date(contractEndDate)
          : null,
        estimatedHoursPerMonth: estimatedHoursPerMonth
          ? parseFloat(estimatedHoursPerMonth)
          : null,
        onboardedAt: new Date(),
        healthSnapshot: {
          contactName,
          contactEmail,
          contactPhone: contactPhone || null,
          contactRole: contactRole || null,
          objectives: objectives || null,
          challenges: challenges || null,
          specialRequirements: specialRequirements || null,
        },
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    // Log initial note if we have objectives/challenges
    if (notesParts.length > 0) {
      await db.advisoryNote.create({
        data: {
          advisoryCaseId: advisoryCase.id,
          authorId: tenant.userId,
          content: notesParts.join("\n\n"),
          isPrivate: true,
        },
      });
    }

    // Log onboarding activity
    await logActivity({
      advisoryCaseId: advisoryCase.id,
      type: "STATUS_CHANGE",
      title: `Client onboarded: ${companyName}`,
      description: `New advisory engagement created with ${
        billingCadence || "monthly"
      } retainer of ${retainerAmount || "TBD"}`,
      performedById: tenant.userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        caseId: advisoryCase.id,
        companyId: company.id,
        companyName: company.name,
      },
    });
  } catch (error: unknown) {
    console.error("[advisory/cases] POST error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create case";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
