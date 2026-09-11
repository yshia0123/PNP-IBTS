"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionStore } from "@/lib/stores/session-store";
import { useUiStore } from "@/lib/stores/ui-store";
import { toast } from "@/lib/stores/toast-store";

/**
 * SettingsForm (SSOT Section 2.2 — SettingsPage). Profile + preferences via
 * React Hook Form + Zod. Prototype: profile edits are local to the session;
 * theme is applied immediately through the UI store.
 */
const schema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  division: z.string().optional(),
  theme: z.enum(["light", "dark"]),
});

type FormValues = z.infer<typeof schema>;

export function SettingsForm() {
  const currentUser = useSessionStore((s) => s.currentUser);
  const setUser = useSessionStore((s) => s.setUser);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      division: currentUser?.division ?? "",
      theme,
    },
  });

  // Load the current user/theme into the form on mount and when they change.
  useEffect(() => {
    reset({
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      division: currentUser?.division ?? "",
      theme,
    });
  }, [currentUser, theme, reset]);

  const onSubmit = (values: FormValues) => {
    if (currentUser) {
      setUser({
        ...currentUser,
        name: values.name,
        email: values.email,
        division: values.division || undefined,
      });
    }
    setTheme(values.theme);
    toast.success("Settings saved", "Your preferences have been updated.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full name" error={errors.name?.message}>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              />
            </Field>
            <Field label="Division / Unit" error={errors.division?.message}>
              <input
                {...register("division")}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Theme" error={errors.theme?.message}>
            <select
              {...register("theme")}
              className="mt-1 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isDirty}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Save changes
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
