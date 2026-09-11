"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/lib/stores/toast-store";
import type { Personnel } from "@/lib/types";
import { useUpdatePersonnel } from "./hooks";

/**
 * EditPersonnelModal (SSOT Phase 4 forms). Admin/HR edit a personnel record.
 */
const schema = z.object({
  fullName: z.string().min(2, "Name is required."),
  rank: z.string().min(1, "Rank is required."),
  serviceYears: z.coerce
    .number()
    .int("Whole years only.")
    .min(0, "Cannot be negative.")
    .max(60, "That seems too high."),
  joinDate: z.string().min(1, "Join date is required."),
  status: z.enum(["active", "retired", "separated"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  personnel: Personnel | null;
  open: boolean;
  onClose: () => void;
}

export function EditPersonnelModal({ personnel, open, onClose }: Props) {
  const update = useUpdatePersonnel();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      rank: "",
      serviceYears: 0,
      joinDate: "",
      status: "active",
    },
  });

  // Load the selected record into the form each time the modal opens.
  useEffect(() => {
    if (open && personnel) {
      reset({
        fullName: personnel.fullName,
        rank: personnel.rank,
        serviceYears: personnel.serviceYears,
        joinDate: personnel.joinDate,
        status: personnel.status,
      });
    }
  }, [open, personnel, reset]);

  if (!personnel) return null;

  const onSubmit = (values: FormValues) => {
    update.mutate(
      { id: personnel.id, ...values },
      {
        onSuccess: () => {
          toast.success("Record updated", `${values.fullName} saved.`);
          onClose();
        },
        onError: (err) =>
          toast.error("Couldn't save changes", (err as Error).message),
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={`Edit — ${personnel.fullName}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Full name" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rank" error={errors.rank?.message}>
            <input
              {...register("rank")}
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Join date" error={errors.joinDate?.message}>
            <input
              type="date"
              {...register("joinDate")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <select
              {...register("status")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="retired">Retired</option>
              <option value="separated">Separated (left service)</option>
            </select>
          </Field>
        </div>

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
            disabled={update.isPending}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {update.isPending ? "Saving…" : "Save changes"}
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
