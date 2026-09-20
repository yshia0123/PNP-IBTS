"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/lib/stores/toast-store";
import { computeServiceYears } from "@/lib/format";
import type { Personnel } from "@/lib/types";
import { useUpdatePersonnel } from "./hooks";

/**
 * EditPersonnelModal (SSOT Phase 4 forms). Admin/HR edit a personnel record.
 * Service years are computed from the date of entry and (for retired/separated)
 * the last day of service — no raw years input.
 */
const schema = z
  .object({
    fullName: z.string().min(2, "Name is required."),
    rank: z.string().min(1, "Rank is required."),
    joinDate: z.string().min(1, "Date of entry is required."),
    separationDate: z.string().optional(),
    status: z.enum(["active", "retired", "separated"]),
  })
  .refine(
    (v) =>
      v.status === "active" ||
      !v.separationDate ||
      new Date(v.separationDate) >= new Date(v.joinDate),
    { message: "Last day must be after the date of entry.", path: ["separationDate"] }
  );

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
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      rank: "",
      joinDate: "",
      separationDate: "",
      status: "active",
    },
  });

  // Load the selected record into the form each time the modal opens.
  useEffect(() => {
    if (open && personnel) {
      reset({
        fullName: personnel.fullName,
        rank: personnel.rank,
        joinDate: personnel.joinDate,
        separationDate: personnel.separationDate ?? "",
        status: personnel.status,
      });
    }
  }, [open, personnel, reset]);

  const status = useWatch({ control, name: "status" });
  const joinDate = useWatch({ control, name: "joinDate" });
  const separationDate = useWatch({ control, name: "separationDate" });
  const isRetiredOrSeparated = status === "retired" || status === "separated";
  const computedYears = computeServiceYears(
    joinDate,
    isRetiredOrSeparated ? separationDate : null
  );

  if (!personnel) return null;

  const onSubmit = (values: FormValues) => {
    const payload = {
      id: personnel.id,
      fullName: values.fullName,
      rank: values.rank,
      joinDate: values.joinDate,
      status: values.status,
      // Only send a separation date for retired/separated; clear it otherwise.
      separationDate:
        values.status === "active" ? null : values.separationDate || null,
    };
    update.mutate(payload, {
      onSuccess: () => {
        toast.success("Record updated", `${values.fullName} saved.`);
        onClose();
      },
      onError: (err) =>
        toast.error("Couldn't save changes", (err as Error).message),
    });
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of entry" error={errors.joinDate?.message}>
            <input
              type="date"
              {...register("joinDate")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            />
          </Field>
          {isRetiredOrSeparated && (
            <Field
              label="Last day of service"
              error={errors.separationDate?.message}
            >
              <input
                type="date"
                {...register("separationDate")}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
              />
            </Field>
          )}
        </div>

        {/* Computed, read-only. */}
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Years of service: </span>
          <span className="font-semibold text-foreground">
            {computedYears} yrs
          </span>
          <span className="text-muted-foreground">
            {" "}
            {isRetiredOrSeparated
              ? "(entry → last day)"
              : "(entry → today, live)"}
          </span>
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
