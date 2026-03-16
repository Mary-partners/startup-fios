// ============================================================
// Client wrapper for StartupTable on the advisory startups page
// ============================================================

"use client";

import StartupTable, { type StartupRow } from "@/components/advisory/startup-table";

interface Props {
  startups: StartupRow[];
}

export default function StartupTableWrapper({ startups }: Props) {
  return <StartupTable startups={startups} basePath="/advisory/startups" filterable />;
}
