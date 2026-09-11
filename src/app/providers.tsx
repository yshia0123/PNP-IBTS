"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Client-only MSW initializer. Loaded with `ssr: false` so `msw/browser`
 * (which sets `node: null` in its package exports) never enters the server
 * module graph.
 */
const MswInit = dynamic(() => import("@/mocks/msw-init"), { ssr: false });

/**
 * The prototype has no real backend — the entire app runs on the MSW mock
 * layer (SSOT Section 3.3), so the worker must run in production (e.g. Vercel)
 * too, not just in local dev. To disable it later when a real API exists, set
 * NEXT_PUBLIC_DISABLE_MSW=true.
 */
const MSW_ENABLED = process.env.NEXT_PUBLIC_DISABLE_MSW !== "true";

/**
 * App-wide client providers:
 *  - MSW startup (SSOT Section 3.3), gated on worker readiness.
 *  - TanStack Query for server-state simulation, caching, and mock fetch
 *    lifecycle.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const tree = (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  if (MSW_ENABLED) {
    return <MswInit>{tree}</MswInit>;
  }

  return tree;
}
