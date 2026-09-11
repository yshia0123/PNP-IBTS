"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionStore } from "@/lib/stores/session-store";
import { toast } from "@/lib/stores/toast-store";
import { Field, fieldInputClass } from "./field";

/**
 * ProfileForm (SSOT Section 2.2). Edit the signed-in user's profile.
 * Prototype: edits are local to the session.
 */
const schema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  division: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm() {
  const currentUser = useSessionStore((s) => s.currentUser);
  const setUser = useSessionStore((s) => s.setUser);

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
    },
  });

  useEffect(() => {
    reset({
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      division: currentUser?.division ?? "",
    });
  }, [currentUser, reset]);

  const onSubmit = (values: FormValues) => {
    if (currentUser) {
      setUser({
        ...currentUser,
        name: values.name,
        email: values.email,
        division: values.division || undefined,
      });
    }
    toast.success("Profile saved", "Your changes have been updated.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full name" error={errors.name?.message}>
            <input {...register("name")} className={fieldInputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Division / Unit" error={errors.division?.message}>
              <input {...register("division")} className={fieldInputClass} />
            </Field>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!isDirty}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Save profile
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
