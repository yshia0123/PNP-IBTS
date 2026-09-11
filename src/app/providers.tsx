"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * App-wide client providers:
 *  - TanStack Query for server-state simulation (SSOT Section 3.3).
 *  - MSW startup in development, so all fetch calls are intercepted before
 *    any data-fetching component runs.
 *
 * Rendering of children is gated on MSW readiness in development to avoid a
 * race where a request fires before the worker is listening.
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

  const [mswReady, setMswReady] = useState(
    () => process.env.NODE_ENV !== "development"
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let active = true;
    (async () => {
      const { worker } = await import("@/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
      });
      if (active) setMswReady(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!mswReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
