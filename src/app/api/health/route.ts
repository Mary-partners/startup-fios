// ============================================================
// Health Check Endpoint — Production monitoring
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    // Database connectivity
    await db.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch {
    checks.database = "unhealthy";
  }

  const allHealthy = Object.values(checks).every((v) => v === "healthy");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
