"use client";

import { useActionState, useState } from "react";
import { createPR, type PRFormState } from "@/lib/actions/pr.actions";
import { ExerciseAutocomplete } from "@/components/ai/ExerciseAutocomplete";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";

const UNITS = ["lbs", "kg", "reps", "seconds", "minutes"] as const;

interface StandalonePRFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StandalonePRForm({
  onSuccess,
  onCancel,
}: StandalonePRFormProps) {
  const [unit, setUnit] = useState<(typeof UNITS)[number]>("lbs");
  const today = format(new Date(), "yyyy-MM-dd");

  const [state, action, pending] = useActionState(
    async (prev: PRFormState, formData: FormData) => {
      const result = await createPR(prev, formData);
      if (result.success) onSuccess?.();
      return result;
    },
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <Input label="Date" name="recorded_at" type="date" defaultValue={today} />
      <input type="hidden" name="unit" value={unit} />
      <input type="hidden" name="is_public" value="true" />

      {/* Exercise */}
      <ExerciseAutocomplete name="exercise" placeholder="e.g. Back Squat" />

      {/* Value + Unit */}
      <div className="space-y-1.5">
        <Input
          label="Value"
          name="value"
          type="number"
          step="0.5"
          min="0"
          placeholder="225"
        />
      </div>

      {/* Unit selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-display font-semibold uppercase tracking-widest text-muted">
          Unit
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {UNITS.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                "px-3 py-1.5 text-xs font-display font-semibold border transition-colors",
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

      {/* Notes */}
      <Input
        label="Notes (optional)"
        name="notes"
        placeholder="3 sets of 5, competition lift, etc."
      />

      {/* Date */}
      <Input label="Date" name="recorded_at" type="date" defaultValue={today} />

      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={pending} size="sm">
          <Check size={12} />
          Save PR
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X size={12} />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
