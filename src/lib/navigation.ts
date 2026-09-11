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

/**
 * Primary sidebar navigation (SSOT Section 2.1 / 2.2).
 * Role-based gating (Section 2.4) is applied in a later phase; for now every
 * item is visible so the shell is fully navigable.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Personnel", href: "/personnel", icon: Users },
  { label: "Claims", href: "/claims", icon: FileText },
  { label: "Retirees", href: "/retirees", icon: UserCheck },
  { label: "Financial", href: "/financial", icon: BarChart3 },
  { label: "Audit Log", href: "/audit", icon: ScrollText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const APP_VERSION = "0.1.0-prototype";
