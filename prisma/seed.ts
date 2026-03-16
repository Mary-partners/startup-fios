// ============================================================
// Database Seed — Example Data
// Run: npx prisma db seed
// ============================================================

import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

// Inline password hashing (same algorithm as src/lib/auth/password.ts)
async function hashPw(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

async function main() {
  console.log("Seeding database...");

  // Hash the demo password
  const demoPasswordHash = await hashPw("demo1234");

  // Create demo user with password for testing
  const user = await prisma.user.upsert({
    where: { email: "demo@cfolead.solutions" },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: "demo@cfolead.solutions",
      name: "Demo Founder",
      externalId: "demo_external_id",
      passwordHash: demoPasswordHash,
    },
  });

  // Create demo company
  const company = await prisma.company.upsert({
    where: { slug: "acme-saas" },
    update: {},
    create: {
      name: "Acme SaaS Inc.",
      slug: "acme-saas",
      industry: "B2B SaaS",
      stage: "seed",
      foundedYear: 2024,
      website: "https://acme-saas.example.com",
    },
  });

  // Create membership
  await prisma.membership.upsert({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: "OWNER",
    },
  });

  // Create subscription (Free tier)
  await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      tier: "FREE",
      status: "ACTIVE",
    },
  });

  // Create 6 months of financial data
  const monthlyData = [
    { year: 2025, month: 10, revenue: 12000, expenses: 45000, cash: 420000, cogs: 2000, concentration: 0.45 },
    { year: 2025, month: 11, revenue: 15000, expenses: 48000, cash: 387000, cogs: 2500, concentration: 0.40 },
    { year: 2025, month: 12, revenue: 18000, expenses: 50000, cash: 355000, cogs: 3000, concentration: 0.35 },
    { year: 2026, month: 1, revenue: 22000, expenses: 52000, cash: 325000, cogs: 3500, concentration: 0.32 },
    { year: 2026, month: 2, revenue: 28000, expenses: 55000, cash: 298000, cogs: 4500, concentration: 0.28 },
    { year: 2026, month: 3, revenue: 33000, expenses: 58000, cash: 273000, cogs: 5500, concentration: 0.25 },
  ];

  for (const data of monthlyData) {
    const period = await prisma.financialPeriod.upsert({
      where: {
        companyId_year_month: {
          companyId: company.id,
          year: data.year,
          month: data.month,
        },
      },
      update: {
        totalRevenue: data.revenue,
        totalExpenses: data.expenses,
        totalCogs: data.cogs,
        netIncome: data.revenue - data.expenses,
      },
      create: {
        companyId: company.id,
        year: data.year,
        month: data.month,
        totalRevenue: data.revenue,
        totalExpenses: data.expenses,
        totalCogs: data.cogs,
        netIncome: data.revenue - data.expenses,
        isFinalized: true,
      },
    });

    // Add revenue records
    await prisma.revenueRecord.create({
      data: {
        financialPeriodId: period.id,
        source: "SaaS MRR",
        amount: data.revenue * 0.8,
        isRecurring: true,
      },
    });
    await prisma.revenueRecord.create({
      data: {
        financialPeriodId: period.id,
        source: "Consulting",
        amount: data.revenue * 0.2,
        isRecurring: false,
      },
    });

    // Add expense records
    const expenseBreakdown = [
      { category: "Payroll & Benefits", amount: data.expenses * 0.6, isFixed: true },
      { category: "Software & Tools", amount: data.expenses * 0.1, isFixed: true },
      { category: "Marketing & Advertising", amount: data.expenses * 0.15, isFixed: false },
      { category: "General & Administrative", amount: data.expenses * 0.15, isFixed: true },
    ];
    for (const exp of expenseBreakdown) {
      await prisma.expenseRecord.create({
        data: {
          financialPeriodId: period.id,
          category: exp.category,
          amount: exp.amount,
          isFixed: exp.isFixed,
        },
      });
    }

    // Cash balance
    await prisma.cashBalance.upsert({
      where: { financialPeriodId: period.id },
      update: { closingBalance: data.cash },
      create: {
        financialPeriodId: period.id,
        openingBalance: data.cash + (data.expenses - data.revenue),
        closingBalance: data.cash,
      },
    });

    // COGS
    await prisma.cogsRecord.upsert({
      where: { financialPeriodId: period.id },
      update: { amount: data.cogs },
      create: {
        financialPeriodId: period.id,
        amount: data.cogs,
      },
    });

    // Customer concentration
    await prisma.customerConcentration.upsert({
      where: { financialPeriodId: period.id },
      update: { largestCustomerShare: data.concentration },
      create: {
        financialPeriodId: period.id,
        largestCustomerShare: data.concentration,
        totalCustomerCount: 12,
      },
    });
  }

  // Create advisory team user
  const advisorPasswordHash = await hashPw("advisor1234");
  const advisor = await prisma.user.upsert({
    where: { email: "advisor@cfolead.solutions" },
    update: { passwordHash: advisorPasswordHash },
    create: {
      email: "advisor@cfolead.solutions",
      name: "Head of Advisory",
      externalId: "advisor_external_id",
      passwordHash: advisorPasswordHash,
    },
  });

  // Create advisory case for the demo company
  await prisma.advisoryCase.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      priority: "MEDIUM",
      status: "active",
      assignedAdvisor: advisor.id,
    },
  });

  console.log("Seed complete.");
  console.log(`  Demo credentials: demo@cfolead.solutions / demo1234`);
  console.log(`  Demo company: Acme SaaS Inc. (slug: acme-saas)`);
  console.log(`  Advisory credentials: advisor@cfolead.solutions / advisor1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
