// ============================================================
// Inngest Client — Background Job Runner
// ============================================================

// NOTE: Inngest is a serverless event-driven job runner.
// Alternative: Use Vercel Cron + QStash for simpler needs.
// This file defines the client and event types.

// To use Inngest:
// 1. npm install inngest
// 2. Create /api/inngest route
// 3. Deploy Inngest functions

// For MVP, you can also implement these as simple async functions
// called after API responses, trading reliability for simplicity.

export interface AppEvents {
  "financial-period/created": {
    data: {
      companyId: string;
      periodId: string;
      year: number;
      month: number;
    };
  };
  "report/generate": {
    data: {
      companyId: string;
      reportId: string;
      reportType: string;
    };
  };
  "alerts/evaluate": {
    data: {
      companyId: string;
    };
  };
  "ai/generate-commentary": {
    data: {
      companyId: string;
      periodId: string;
    };
  };
}

// Placeholder: In production, initialize the actual Inngest client
// import { Inngest } from "inngest";
// export const inngest = new Inngest({ id: "startup-fios" });

// For MVP without Inngest, use this simple async dispatcher:
type EventHandler<T> = (data: T) => Promise<void>;

const handlers: Record<string, EventHandler<any>[]> = {};

export function on<K extends keyof AppEvents>(
  event: K,
  handler: EventHandler<AppEvents[K]["data"]>
) {
  if (!handlers[event]) handlers[event] = [];
  handlers[event].push(handler);
}

export async function emit<K extends keyof AppEvents>(
  event: K,
  data: AppEvents[K]["data"]
) {
  const eventHandlers = handlers[event] ?? [];
  // Fire and forget — don't block the caller
  Promise.allSettled(eventHandlers.map((h) => h(data))).catch(console.error);
}
