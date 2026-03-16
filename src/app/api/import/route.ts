// ============================================================
// /api/import — CSV and Excel file upload for financial data
// Authenticated, company-scoped.
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/client";
import { resolveTenantContext } from "@/lib/auth/tenant";
import { requirePermission } from "@/lib/auth/permissions";
import * as XLSX from "xlsx";

interface DataRow {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  cash_balance: number;
  cogs: number;
}

function parseCsvContent(content: string): DataRow[] {
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

  const rows: DataRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length < header.length) {
      errors.push(`Row ${i + 1}: not enough columns`);
      continue;
    }

    const month = parseInt(values[colIndex["month"]], 10);
    const year = parseInt(values[colIndex["year"]], 10);
    const revenue = parseFloat(values[colIndex["revenue"]]);
    const expenses = parseFloat(values[colIndex["expenses"]]);
    const cash_balance = parseFloat(values[colIndex["cash_balance"]]);
    const cogs = parseFloat(values[colIndex["cogs"]]);

    if (isNaN(month) || month < 1 || month > 12) { errors.push(`Row ${i + 1}: invalid month`); continue; }
    if (isNaN(year) || year < 1900 || year > 2100) { errors.push(`Row ${i + 1}: invalid year`); continue; }
    if (isNaN(revenue)) { errors.push(`Row ${i + 1}: invalid revenue`); continue; }
    if (isNaN(expenses)) { errors.push(`Row ${i + 1}: invalid expenses`); continue; }
    if (isNaN(cash_balance)) { errors.push(`Row ${i + 1}: invalid cash_balance`); continue; }

    rows.push({ month, year, revenue, expenses, cash_balance, cogs: isNaN(cogs) ? 0 : cogs });
  }

  if (rows.length === 0) {
    throw new Error(`No valid data rows found.${errors.length > 0 ? " Errors: " + errors.join("; ") : ""}`);
  }
  return rows;
}

function parseExcelContent(buffer: ArrayBuffer): DataRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel file has no sheets.");

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: 0 });

  if (jsonData.length === 0) {
    throw new Error("Excel sheet is empty. Please add data rows.");
  }

  // Normalize column names (case-insensitive, trim, replace spaces with underscores)
  const normalize = (key: string) => key.toLowerCase().trim().replace(/\s+/g, "_");

  const rows: DataRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const raw = jsonData[i];
    const row: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      row[normalize(key)] = value;
    }

    const month = Number(row["month"] ?? 0);
    const year = Number(row["year"] ?? 0);
    const revenue = Number(row["revenue"] ?? 0);
    const expenses = Number(row["expenses"] ?? 0);
    const cash_balance = Number(row["cash_balance"] ?? row["cashbalance"] ?? row["cash"] ?? 0);
    const cogs = Number(row["cogs"] ?? row["cost_of_goods"] ?? 0);

    if (isNaN(month) || month < 1 || month > 12) { errors.push(`Row ${i + 2}: invalid month`); continue; }
    if (isNaN(year) || year < 1900 || year > 2100) { errors.push(`Row ${i + 2}: invalid year`); continue; }
    if (isNaN(revenue)) { errors.push(`Row ${i + 2}: invalid revenue`); continue; }
    if (isNaN(expenses)) { errors.push(`Row ${i + 2}: invalid expenses`); continue; }

    rows.push({
      month,
      year,
      revenue,
      expenses,
      cash_balance: isNaN(cash_balance) ? 0 : cash_balance,
      cogs: isNaN(cogs) ? 0 : cogs,
    });
  }

  if (rows.length === 0) {
    throw new Error(`No valid data rows found.${errors.length > 0 ? " Errors: " + errors.join("; ") : ""}`);
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
        { success: false, error: "No file provided. Please upload a CSV or Excel file." },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const isCSV = filename.endsWith(".csv");
    const isExcel = filename.endsWith(".xlsx") || filename.endsWith(".xls");

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        { success: false, error: "Unsupported file format. Please upload a .csv, .xlsx, or .xls file." },
        { status: 400 }
      );
    }

    let rows: DataRow[];

    if (isCSV) {
      const text = await file.text();
      if (!text.trim()) {
        return NextResponse.json({ success: false, error: "File is empty." }, { status: 400 });
      }
      rows = parseCsvContent(text);
    } else {
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength === 0) {
        return NextResponse.json({ success: false, error: "File is empty." }, { status: 400 });
      }
      rows = parseExcelContent(buffer);
    }

    // Create financial periods
    let created = 0;
    let skipped = 0;
    const skippedPeriods: string[] = [];

    for (const row of rows) {
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
            create: [{ source: "Imported Revenue", amount: row.revenue, isRecurring: false }],
          },
          expenseRecords: {
            create: [{ category: "Imported Expenses", amount: row.expenses, isFixed: false }],
          },
          cashBalance: {
            create: { openingBalance: row.cash_balance, closingBalance: row.cash_balance },
          },
          ...(row.cogs > 0 && {
            cogsRecord: { create: { amount: row.cogs } },
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
        skippedPeriods: skippedPeriods.length > 0 ? `Already existing: ${skippedPeriods.join(", ")}` : undefined,
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
