import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { StatusBar } from "./status-bar";
import { Toaster } from "@/components/ui/toaster";

/**
 * Root shell composition (SSOT Section 2.1).
 *
 *  ┌───────────────────────────────┐
 *  │ SIDEBAR │ HEADER              │
 *  │         ├─────────────────────┤
 *  │         │ MAIN (page content) │
 *  │         ├─────────────────────┤
 *  │         │ STATUS BAR          │
 *  └───────────────────────────────┘
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <StatusBar />
      </div>
      <Toaster />
    </div>
  );
}
