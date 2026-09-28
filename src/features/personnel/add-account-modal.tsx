"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/lib/stores/toast-store";
import { computeServiceYears } from "@/lib/format";
import { useCreateAccount } from "./hooks";

/**
 * AddAccountModal (SSOT Phase 4 forms). Admin creates a new officer account,
 * capturing their rank and date of entry (years of service are computed).
 */
const schema = z.object({
  fullName: z.string().min(2, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  rank: z.string().min(1, "Rank is required."),
  joinDate: z.string().min(1, "Date of entry is required."),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddAccountModal({ open, onClose }: Props) {
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
      rank: "",
      joinDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      create.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const joinDate = useWatch({ control, name: "joinDate" });
  const computedYears = computeServiceYears(joinDate);

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
    <Modal open={open} onClose={onClose} title="Add New Officer">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            {...register("email")}
            placeholder="name@ibts.local"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rank" error={errors.rank?.message}>
            <input
              {...register("rank")}
              placeholder="e.g. PCPT"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </Field>
          <Field label="Date of entry" error={errors.joinDate?.message}>
            <input
              type="date"
              {...register("joinDate")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </Field>
        </div>

        {joinDate && (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Years of service: </span>
            <span className="font-semibold text-foreground">
              {computedYears} yrs
            </span>
            <span className="text-muted-foreground"> (entry → today, live)</span>
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
