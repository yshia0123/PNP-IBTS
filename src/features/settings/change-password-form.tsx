"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/stores/toast-store";
import { useChangePassword } from "@/features/auth/hooks";
import { Field, fieldInputClass } from "./field";

/**
 * ChangePasswordForm (SSOT Section 2.2). Validates the current password via
 * MSW and updates the credential. Mock only (Section 1.4).
 */
const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  });

type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password changed", "Use it the next time you sign in.");
          reset();
        },
        onError: (err) =>
          toast.error("Couldn't change password", (err as Error).message),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Current password" error={errors.currentPassword?.message}>
            <input
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
              className={fieldInputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="New password" error={errors.newPassword?.message}>
              <input
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
                className={fieldInputClass}
              />
            </Field>
            <Field
              label="Confirm new password"
              error={errors.confirmPassword?.message}
            >
              <input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={fieldInputClass}
              />
            </Field>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {changePassword.isPending ? "Updating…" : "Update password"}
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
