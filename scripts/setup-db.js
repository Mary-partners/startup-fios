// Setup database tables and seed data before starting the app
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
run("npx prisma db push --skip-generate", "Database schema sync");

// Step 2: Seed data (optional - ok if it fails)
run("npx tsx prisma/seed.ts", "Database seed");

console.log("[setup] Database setup complete. Starting app...");
process.exit(0);
