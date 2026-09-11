"use client";

import { useEffect, useState } from "react";
import { worker } from "./browser";

/**
 * Starts the Mock Service Worker in the browser.
 *
 * This component is loaded via `next/dynamic({ ssr: false })` so that
 * `msw/browser` (whose package exports set `node: null`) is never pulled into
 * the server module graph. It renders `children` only once the worker is
 * listening, preventing a race where a request fires before interception is
 * active (MSW "deferred mounting").
 */
export default function MswInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    worker
      .start({ onUnhandledRequest: "bypass" })
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        // If the worker fails to register, still render the app so the
        // prototype remains usable; unhandled requests just pass through.
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
