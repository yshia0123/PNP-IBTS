"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/lib/stores/toast-store";
import type { Personnel } from "@/lib/types";
import { useCreateAccount } from "./hooks";

/**
 * AddAccountModal (SSOT Phase 4 forms). Admin creates a new officer, retiree,
 * or dependent account. Personnel-backed roles capture service details;
 * dependents capture relationship + sponsor.
 */
const schema = z
  .object({
    fullName: z.string().min(2, "Name is required."),
    email: z.string().min(1, "Email is required.").email("Enter a valid email."),
    role: z.enum(["officer", "retiree", "dependent"]),
    rank: z.string().optional(),
    serviceYears: z.coerce.number().int().min(0).max(60).optional(),
    joinDate: z.string().optional(),
    relationship: z.enum(["spouse", "child", "parent", "other"]).optional(),
    sponsorPersonnelId: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "officer" || val.role === "retiree") {
      if (!val.rank)
        ctx.addIssue({
          code: "custom",
          path: ["rank"],
          message: "Rank is required for this role.",
        });
    }
    if (val.role === "dependent") {
      if (!val.relationship)
        ctx.addIssue({
          code: "custom",
          path: ["relationship"],
          message: "Relationship is required.",
        });
      if (!val.sponsorPersonnelId)
        ctx.addIssue({
          code: "custom",
          path: ["sponsorPersonnelId"],
          message: "Select a sponsor.",
        });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  personnel: Personnel[];
}

export function AddAccountModal({ open, onClose, personnel }: Props) {
  const create = useCreateAccount();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "officer",
      rank: "",
      serviceYears: 0,
      joinDate: "",
      relationship: undefined,
      sponsorPersonnelId: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      create.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const role = useWatch({ control, name: "role" });
  const isPersonnelRole = role === "officer" || role === "retiree";
  const isDependent = role === "dependent";

  const onSubmit = (values: FormValues) => {
    create.mutate(values, {
      onSuccess: () => {
        toast.success("Account created", `${values.fullName} was added.`);
        onClose();
      },
      onError: (err) =>
        toast.error("Couldn't create account", (err as Error).message),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              {...register("email")}
              placeholder="name@ibts.local"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </Field>
          <Field label="Role" error={errors.role?.message}>
            <select
              {...register("role")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="officer">Officer</option>
              <option value="retiree">Retiree</option>
              <option value="dependent">Dependent</option>
            </select>
          </Field>
        </div>

        {isPersonnelRole && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rank" error={errors.rank?.message}>
                <input
                  {...register("rank")}
                  placeholder="e.g. PCPT"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </Field>
              <Field label="Service years" error={errors.serviceYears?.message}>
                <input
                  type="number"
                  {...register("serviceYears")}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </Field>
            </div>
            <Field label="Join date" error={errors.joinDate?.message}>
              <input
                type="date"
                {...register("joinDate")}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              />
            </Field>
          </>
        )}

        {isDependent && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Relationship" error={errors.relationship?.message}>
              <select
                {...register("relationship")}
                defaultValue=""
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Sponsor" error={errors.sponsorPersonnelId?.message}>
              <select
                {...register("sponsorPersonnelId")}
                defaultValue=""
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="" disabled>
                  Select personnel…
                </option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.rank} {p.fullName}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {create.isError && (
          <p className="text-sm text-danger">
            {(create.error as Error).message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create account"}
          </button>
        </div>
      </form>
    </Modal>
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
