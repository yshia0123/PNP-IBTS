"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { useMyBenefitOptions, useSubmitClaim } from "./hooks";

/**
 * ClaimRequestModal (SSOT Section 2.2 / Phase 4 forms).
 * Officers and retirees use this to request a claim against one of their own
 * benefits. Validated with React Hook Form + Zod; submits via MSW POST.
 */
const schema = z.object({
  benefitId: z.string().min(1, "Please select a benefit."),
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ClaimRequestModal({ open, onClose }: Props) {
  const benefits = useMyBenefitOptions();
  const submit = useSubmitClaim();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { benefitId: "", notes: "" },
  });

  // Reset form + mutation state whenever the modal is (re)opened.
  useEffect(() => {
    if (open) {
      reset({ benefitId: "", notes: "" });
      submit.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (values: FormValues) => {
    submit.mutate({ benefitId: values.benefitId, notes: values.notes });
  };

  const handleClose = () => {
    submit.reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="New Claim Request">
      {submit.isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground">
            Claim request submitted
          </p>
          <p className="text-sm text-muted-foreground">
            Your request has been sent to the administrator for review. You can
            track its status in your claims list.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Done
          </button>
        </div>
      ) : benefits.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : benefits.data && benefits.data.length === 0 ? (
        <EmptyState
          message="No benefits on record"
          hint="You need at least one benefit before you can request a claim."
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="benefitId"
              className="block text-sm font-medium text-foreground"
            >
              Benefit
            </label>
            <select
              id="benefitId"
              {...register("benefitId")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="">Select a benefit…</option>
              {benefits.data?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                  {b.amount != null ? ` — ${formatCurrency(b.amount)}` : ""}
                </option>
              ))}
            </select>
            {errors.benefitId && (
              <p className="mt-1 text-xs text-danger">
                {errors.benefitId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-foreground"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register("notes")}
              placeholder="Add any details for the reviewer…"
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground focus:outline-none"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-danger">{errors.notes.message}</p>
            )}
          </div>

          {submit.isError && (
            <p className="text-sm text-danger">
              {(submit.error as Error).message ??
                "Something went wrong. Please try again."}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submit.isPending}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submit.isPending ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
