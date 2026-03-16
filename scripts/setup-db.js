// Setup database tables and seed data before starting the app
// NOTE: This script should be run during build/deploy, NOT during app startup
// Run via: npm run db:setup OR during Railway build hook
const { execSync } = require("child_process");

function run(cmd, label) {
  try {
    console.log(`[setup] Running: ${label}...`);
    execSync(cmd, { stdio: "inherit", timeout: 60000 });
    console.log(`[setup] ${label} completed.`);
    return true;
  } catch (err) {
    console.error(`[setup] ${label} failed:`, err.message);
    return false;
  }
}

// Step 1: Push schema to database
const schemaOk = run("npx prisma db push --skip-generate", "Database schema sync");

// Step 2: Seed data (optional - ok if it fails)
run("npx tsx prisma/seed.ts", "Database seed");

console.log("[setup] Database setup complete.");
// Do NOT exit - let the caller decide what to do next
// process.exit(0) was preventing next start from running!
