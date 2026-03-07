"use client";

import { useActionState, useState } from "react";
import { createPR, type PRFormState } from "@/lib/actions/pr.actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trophy, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ExerciseAutocomplete } from "@/components/ai/ExerciseAutocomplete";

interface PREntryProps {
  logId?: string;
  logDate: string;
  existingPRs: {
    id: string;
    exercise: string;
    value: number;
    unit: string;
    notes: string | null;
  }[];
}

const UNITS = ["lbs", "kg", "reps", "seconds", "minutes"] as const;

export function PREntry({ logId, logDate, existingPRs }: PREntryProps) {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<(typeof UNITS)[number]>("lbs");
  const [isPublic, setIsPublic] = useState(false);

  const [state, action, pending] = useActionState(
    async (prev: PRFormState, formData: FormData) => {
      const result = await createPR(prev, formData);
      if (result.success) setOpen(false);
      return result;
    },
    {},
  );

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-yellow-500" />
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
            Personal Records
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs font-display font-semibold text-muted hover:text-brand transition-colors"
        >
          <Plus size={12} />
          Add PR
        </button>
      </div>

      {/* Existing PRs */}
      {existingPRs.length > 0 && (
        <div className="space-y-1.5">
          {existingPRs.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-surface border border-base"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
              <span className="font-display text-sm font-semibold flex-1">
                {pr.exercise}
              </span>
              <span className="font-display text-sm tabular-nums">
                {pr.value} <span className="text-muted text-xs">{pr.unit}</span>
              </span>
              {pr.notes && (
                <span className="text-xs text-muted truncate max-w-[120px]">
                  {pr.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add PR form */}
      {open && (
        <div className="border border-[hsl(var(--brand-glow)/0.3)] bg-[hsl(var(--brand)/0.04)] p-4 space-y-3">
          <form action={action} className="space-y-3">
            {/* Hidden fields */}
            <input type="hidden" name="log_id" value={logId ?? ""} />
            <input type="hidden" name="recorded_at" value={logDate} />
            <input type="hidden" name="unit" value={unit} />
            <input type="hidden" name="is_public" value={String(isPublic)} />

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <ExerciseAutocomplete
                  name="exercise"
                  placeholder="e.g. Back Squat"
                />
              </div>
              <Input
                label="Value"
                name="value"
                type="number"
                step="0.5"
                placeholder="225"
              />
              {/* Unit selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-display font-semibold uppercase tracking-widest text-muted">
                  Unit
                </label>
                <div className="flex gap-1 flex-wrap">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={cn(
                        "px-2 py-1 text-xs font-display font-semibold border transition-colors",
                        unit === u
                          ? "border-[hsl(var(--brand-glow))] text-brand bg-[hsl(var(--brand)/0.1)]"
                          : "border-base text-muted hover:border-[hsl(var(--foreground)/0.3)]",
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Input
                  label="Notes (optional)"
                  name="notes"
                  placeholder="3 sets of 5, felt strong"
                />
              </div>
            </div>

            {/* Public toggle */}
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={cn(
                "flex items-center gap-2 text-xs font-display font-semibold transition-colors",
                isPublic ? "text-brand" : "text-muted",
              )}
            >
              <div
                className={cn(
                  "w-7 h-4 rounded-full border transition-colors relative",
                  isPublic ? "bg-brand border-brand" : "border-base bg-surface",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                    isPublic ? "left-3.5" : "left-0.5",
                  )}
                />
              </div>
              {isPublic ? "Public PR" : "Private PR"}
            </button>

            {state?.error && (
              <p className="text-xs text-red-500">{state.error}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" loading={pending} size="sm">
                <Check size={12} /> Save PR
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                <X size={12} /> Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {existingPRs.length === 0 && !open && (
        <p className="text-xs text-muted italic">No PRs logged for this day.</p>
      )}
    </div>
  );
}
