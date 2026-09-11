import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";
import type { ModuleKey } from "@/lib/permissions";

/**
 * Primary sidebar navigation (SSOT Section 2.1 / 2.2).
 * Visibility is gated per role via the `key` and the Section 2.4 matrix in
 * lib/permissions.ts.
 */
export interface NavItem {
  key: ModuleKey;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { key: "personnel", label: "Personnel", href: "/personnel", icon: Users },
  { key: "claims", label: "Claims", href: "/claims", icon: FileText },
  { key: "retirees", label: "Retirees", href: "/retirees", icon: UserCheck },
  { key: "financial", label: "Financial", href: "/financial", icon: BarChart3 },
  { key: "audit", label: "Audit Log", href: "/audit", icon: ScrollText },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export const APP_VERSION = "0.1.0-prototype";
