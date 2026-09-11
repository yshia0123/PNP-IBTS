import { create } from "zustand";

/**
 * Global UI/local state (SSOT Section 3.1 — Zustand for UI state).
 * Phase 1 scope: sidebar collapse. `theme` is included as a light-touch
 * primitive the Settings page will wire up later; it is not persisted yet.
 */
type Theme = "light" | "dark";

interface UiState {
  sidebarCollapsed: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  theme: "light",
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTheme: (theme) => set({ theme }),
}));
