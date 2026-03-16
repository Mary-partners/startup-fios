// ============================================================
// useApi — Generic fetch wrapper with loading/error state
// ============================================================

"use client";

import { useState, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = unknown>(
  fetcher: (...args: unknown[]) => Promise<Response>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const res = await fetcher(...args);
        const json = await res.json();
        if (!res.ok || json.error) {
          const errMsg = json.error ?? `Request failed (${res.status})`;
          setState({ data: null, loading: false, error: errMsg });
          return null;
        }
        const data = json.data ?? json;
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [fetcher]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// ── Convenience wrapper for JSON POST ──────────────────────
export function useApiPost<TReq, TRes>(url: string) {
  return useApi<TRes>(async (body?: unknown) => {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body as TReq),
    });
  });
}

// ── Convenience wrapper for GET ────────────────────────────
export function useApiGet<TRes>(url: string) {
  return useApi<TRes>(async () => fetch(url));
}
