import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { format } from "date-fns";

export default async function PRsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prs } = await supabase
    .from("personal_records")
    .select("id, exercise, value, unit, notes, recorded_at, is_public")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false });

  // Group PRs by exercise, keep only personal best per exercise
  type PR = NonNullable<typeof prs>[number];

  const bestByExercise = (prs ?? []).reduce<Record<string, PR>>((acc, pr) => {
    if (!acc[pr.exercise] || pr.value > acc[pr.exercise].value) {
      acc[pr.exercise] = pr;
    }
    return acc;
  }, {});

  const bests = Object.values(bestByExercise).sort((a, b) =>
    a.exercise.localeCompare(b.exercise),
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-1">
          All time
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Personal Records
        </h1>
      </div>

      {bests.length === 0 ? (
        <div className="border border-dashed border-base p-12 text-center">
          <Trophy size={32} className="text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted font-display">No PRs yet.</p>
          <p className="text-xs text-muted mt-1">
            Add PRs when logging a training day.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-4 pb-2">
            <span className="col-span-5 text-xs font-display font-semibold uppercase tracking-widest text-muted">
              Exercise
            </span>
            <span className="col-span-3 text-xs font-display font-semibold uppercase tracking-widest text-muted">
              Best
            </span>
            <span className="col-span-3 text-xs font-display font-semibold uppercase tracking-widest text-muted">
              Date
            </span>
            <span className="col-span-1" />
          </div>

          {bests.map((pr) => (
            <div
              key={pr.id}
              className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-surface border border-base hover:border-[hsl(var(--border))] group transition-colors"
            >
              <div className="col-span-5 flex items-center gap-2">
                <Trophy size={12} className="text-yellow-500 flex-shrink-0" />
                <span className="font-display text-sm font-semibold truncate">
                  {pr.exercise}
                </span>
              </div>
              <div className="col-span-3">
                <span className="font-display text-sm font-bold tabular-nums">
                  {pr.value}
                </span>
                <span className="text-xs text-muted ml-1">{pr.unit}</span>
              </div>
              <div className="col-span-3">
                <span className="text-xs text-muted font-display">
                  {format(
                    new Date(pr.recorded_at + "T12:00:00"),
                    "MMM d, yyyy",
                  )}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                {!pr.is_public && (
                  <span className="text-xs text-muted border border-base px-1 font-display">
                    pvt
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All history */}
      {(prs?.length ?? 0) > bests.length && (
        <section className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
            Full History
          </h2>
          <div className="space-y-1">
            {(prs ?? []).map((pr) => (
              <div
                key={pr.id}
                className="flex items-center gap-4 px-4 py-2.5 bg-surface border border-base text-sm"
              >
                <span className="font-display font-medium flex-1 truncate">
                  {pr.exercise}
                </span>
                <span className="font-display tabular-nums text-muted">
                  {pr.value} <span className="text-xs">{pr.unit}</span>
                </span>
                <span className="text-xs text-muted font-display">
                  {format(new Date(pr.recorded_at + "T12:00:00"), "MMM d")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
