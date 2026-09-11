import { create } from "zustand";

/**
 * Lightweight toast system (SSOT Section 2.2 reused `Toast` component).
 * In-house (no dependency): a store holds active toasts; the <Toaster />
 * mounted in the shell renders them and auto-dismisses after a timeout.
 */
export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Convenience helpers usable outside React (e.g. in mutation callbacks). */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, variant: "error" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, variant: "info" }),
};
