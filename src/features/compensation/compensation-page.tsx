"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useSessionStore } from "@/lib/stores/session-store";
import { can } from "@/lib/permissions";
import { toast } from "@/lib/stores/toast-store";
import {
  computeCal,
  computeCompensationProfile,
  EMPTY_COMPENSATION_INPUTS,
  type CompensationProfileInputs,
} from "@/lib/compensation";
import {
  usePersonnelList,
  usePersonCompensation,
  useSaveCompensation,
} from "./hooks";
import { PersonSearch } from "./components/person-search";
import { CompensationEditor } from "./components/compensation-editor";
import { ComputedBreakdown } from "./components/computed-breakdown";
import { CALCalculatorPanel } from "./components/cal-calculator-panel";

/** Parse a raw CAL input; returns null when blank / non-numeric. */
function parseNonNegative(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return n;
}

/**
 * Base Pay & Compensation — per-person editing tool. Pick an officer/retiree,
 * load their tentative compensation (computed from rank + service years), let
 * the Admin adjust the situational allowances, preview the recompute live, and
 * save it back to their personnel record. HR sees everything read-only.
 * Access is gated through the existing role state (session store + permissions).
 */
export function CompensationPage() {
  const role = useSessionStore((s) => s.currentUser?.role ?? "dependent");
  const canEdit = can(role, "compensation.override");

  const { data: people, isLoading: loadingPeople } = usePersonnelList();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: comp, isLoading: loadingComp } =
    usePersonCompensation(selectedId);
  const save = useSaveCompensation(selectedId);

  // Local editable copy of the saved inputs. We reset it during render (React's
  // recommended pattern) whenever the loaded person/inputs change, keyed by the
  // person id + a cheap signature, avoiding a setState-in-effect.
  const [draft, setDraft] = useState<CompensationProfileInputs>(
    EMPTY_COMPENSATION_INPUTS
  );
  const loadedSig = comp ? `${comp.person.id}:${JSON.stringify(comp.inputs)}` : null;
  const [syncedSig, setSyncedSig] = useState<string | null>(null);
  if (loadedSig && loadedSig !== syncedSig) {
    setDraft(comp!.inputs);
    setSyncedSig(loadedSig);
  }

  // CAL inputs (tied to the selected person's computed base pay + LP).
  const [grossRaw, setGrossRaw] = useState("");
  const [yearsRaw, setYearsRaw] = useState("");

  // Live preview: recompute from the draft so edits show before saving.
  const preview =
    comp && selectedId
      ? computeCompensationProfile({
          rank: comp.person.rank,
          tableBasePay: comp.tableBasePay,
          yearsOfActiveService: comp.person.serviceYears,
          inputs: draft,
        })
      : null;

  const basePay = preview?.basePay ?? 0;
  const lpAmount = preview?.lpAmount ?? 0;

  const gross = parseNonNegative(grossRaw);
  const years = parseNonNegative(yearsRaw);
  const grossInvalid = grossRaw.trim() !== "" && (gross === null || gross < 0);
  const yearsInvalid = yearsRaw.trim() !== "" && (years === null || years < 0);
  const calResult =
    gross !== null && years !== null && !grossInvalid && !yearsInvalid
      ? computeCal({
          basePay,
          longevityPay: lpAmount,
          grossLeaveCredits: gross,
          yearsOfActiveService: years,
        })
      : null;

  const handleSave = () => {
    save.mutate(draft, {
      onSuccess: () => toast.success("Compensation saved."),
      onError: (e) =>
        toast.error("Save failed", e instanceof Error ? e.message : undefined),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Base Pay &amp; Compensation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a person to view and edit their compensation. Base Pay,
          Longevity Pay, bonuses, and pension estimates are computed from their
          rank and service years.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Person picker */}
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Select Person</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonSearch
              people={people ?? []}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loadingPeople}
            />
          </CardContent>
        </Card>

        {/* Working area */}
        <div className="space-y-6">
          {!selectedId ? (
            <EmptyState
              message="No person selected."
              hint="Search and pick someone on the left to load their compensation."
            />
          ) : loadingComp || !comp || !preview ? (
            <EmptyState message="Loading compensation…" />
          ) : (
            <>
              {!canEdit && (
                <div className="rounded-md border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                  Read-only view. Editing compensation is restricted to Admin.
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canEdit || save.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {save.isPending ? "Saving…" : "Save Compensation"}
                </button>
              </div>

              <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                <CompensationEditor
                  inputs={draft}
                  onChange={setDraft}
                  readOnly={!canEdit}
                />
                <ComputedBreakdown
                  computed={preview}
                  personName={comp.person.fullName}
                  rank={comp.person.rank}
                  salaryGrade={comp.salaryGrade}
                  status={comp.person.status}
                  joinDate={comp.person.joinDate}
                  separationDate={comp.person.separationDate}
                  serviceYears={comp.person.serviceYears}
                />
              </div>

              <CALCalculatorPanel
                grossRaw={grossRaw}
                yearsRaw={yearsRaw}
                onGrossChange={setGrossRaw}
                onYearsChange={setYearsRaw}
                grossInvalid={grossInvalid}
                yearsInvalid={yearsInvalid}
                result={calResult}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
