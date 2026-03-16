// ============================================================
// Prisma Client Singleton
// Prevents hot-reload from creating multiple instances.
// Includes connection pooling limits for serverless (Vercel).
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
    datasourceUrl: addPoolParams(process.env.DATABASE_URL),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Adds connection pool parameters to the DATABASE_URL if not already present.
 * Keeps connections low for serverless (Vercel) to avoid exhausting Neon limits.
 */
function addPoolParams(url: string | undefined): string | undefined {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  // Skip if user already configured pool params
  if (url.includes("connection_limit")) return url;
  return `${url}${separator}connection_limit=5&pool_timeout=10`;
}

// Graceful shutdown
if (process.env.NODE_ENV === "production") {
  process.on("SIGINT", async () => {
    await db.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await db.$disconnect();
    process.exit(0);
  });
}
