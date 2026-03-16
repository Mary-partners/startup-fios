// ============================================================
// /api/import — CSV file upload and parsing for financial data
// Authenticated, company-scoped.
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";

interface CsvRow {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  cash_balance: number;
  cogs: number;
}

function parseCsvContent(content: string): CsvRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row.");
  }

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());

  const requiredColumns = ["month", "year", "revenue", "expenses", "cash_balance", "cogs"];
  const missingColumns = requiredColumns.filter((col) => !header.includes(col));
  if (missingColumns.length > 0) {
    throw new Error(
      `Missing required columns: ${missingColumns.join(", ")}. Expected: ${requiredColumns.join(", ")}`
    );
  }

  const colIndex: Record<string, number> = {};
  for (const col of requiredColumns) {
    colIndex[col] = header.indexOf(col);
  }

  const rows: CsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());

    if (values.length < header.length) {
      errors.push(`Row ${i + 1}: not enough columns (expected ${header.length}, got ${values.length})`);
      continue;
    }

    const month = parseInt(values[colIndex["month"]], 10);
    const year = parseInt(values[colIndex["year"]], 10);
    const revenue = parseFloat(values[colIndex["revenue"]]);
    const expenses = parseFloat(values[colIndex["expenses"]]);
    const cash_balance = parseFloat(values[colIndex["cash_balance"]]);
    const cogs = parseFloat(values[colIndex["cogs"]]);

    if (isNaN(month) || month < 1 || month > 12) {
      errors.push(`Row ${i + 1}: invalid month "${values[colIndex["month"]]}"`);
      continue;
    }
    if (isNaN(year) || year < 1900 || year > 2100) {
      errors.push(`Row ${i + 1}: invalid year "${values[colIndex["year"]]}"`);
      continue;
    }
    if (isNaN(revenue)) {
      errors.push(`Row ${i + 1}: invalid revenue "${values[colIndex["revenue"]]}"`);
      continue;
    }
    if (isNaN(expenses)) {
      errors.push(`Row ${i + 1}: invalid expenses "${values[colIndex["expenses"]]}"`);
      continue;
    }
    if (isNaN(cash_balance)) {
      errors.push(`Row ${i + 1}: invalid cash_balance "${values[colIndex["cash_balance"]]}"`);
      continue;
    }

    rows.push({
      month,
      year,
      revenue,
      expenses,
      cash_balance,
      cogs: isNaN(cogs) ? 0 : cogs,
    });
  }

  if (rows.length === 0) {
    throw new Error(
      `No valid data rows found.${errors.length > 0 ? " Errors: " + errors.join("; ") : ""}`
    );
  }

  return rows;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await resolveTenantContext(userId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: "No company found" }, { status: 400 });
    }

    requirePermission(tenant.role, "financials:write");

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided. Please upload a CSV file." },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".csv")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only CSV files are supported at this time. Please upload a .csv file.",
        },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();
    if (!text.trim()) {
      return NextResponse.json(
        { success: false, error: "File is empty." },
        { status: 400 }
      );
    }

    // Parse CSV
    const rows = parseCsvContent(text);

    // Create financial periods for each row
    let created = 0;
    let skipped = 0;
    const skippedPeriods: string[] = [];

    for (const row of rows) {
      // Check if period already exists
      const existing = await db.financialPeriod.findUnique({
        where: {
          companyId_year_month: {
            companyId: tenant.companyId,
            year: row.year,
            month: row.month,
          },
        },
      });

      if (existing) {
        skipped++;
        skippedPeriods.push(`${row.month}/${row.year}`);
        continue;
      }

      const netIncome = row.revenue - row.expenses;

      await db.financialPeriod.create({
        data: {
          companyId: tenant.companyId,
          year: row.year,
          month: row.month,
          totalRevenue: row.revenue,
          totalExpenses: row.expenses,
          totalCogs: row.cogs,
          netIncome,
          revenueRecords: {
            create: [
              {
                source: "Imported Revenue",
                amount: row.revenue,
                isRecurring: false,
              },
            ],
          },
          expenseRecords: {
            create: [
              {
                category: "Imported Expenses",
                amount: row.expenses,
                isFixed: false,
              },
            ],
          },
          cashBalance: {
            create: {
              openingBalance: row.cash_balance,
              closingBalance: row.cash_balance,
            },
          },
          ...(row.cogs > 0 && {
            cogsRecord: {
              create: { amount: row.cogs },
            },
          }),
        },
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: created,
        skipped,
        total: rows.length,
        skippedPeriods:
          skippedPeriods.length > 0
            ? `Already existing: ${skippedPeriods.join(", ")}`
            : undefined,
      },
    });
  } catch (error: any) {
    console.error("POST /api/import error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to import file" },
      { status: 500 }
    );
  }
}
