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

const MSW_ENABLED = process.env.NODE_ENV === "development";

/**
 * App-wide client providers:
 *  - MSW startup in development (SSOT Section 3.3), gated on worker readiness.
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
