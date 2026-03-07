import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Trophy, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WeeklySummary } from "@/components/ai/WeeklySummary";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");

  // Parallel fetches — faster than sequential awaits
  const [profileRes, recentLogsRes, prCountRes, todayLogRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("username, full_name")
        .eq("id", user.id)
        .single(),

      supabase
        .from("logs")
        .select("id, log_date, type, comment, is_public")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(5),

      supabase
        .from("personal_records")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),

      supabase
        .from("logs")
        .select("id, type")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .maybeSingle(),
    ]);

  const profile = profileRes.data;
  const recentLogs = recentLogsRes.data ?? [];
  const prCount = prCountRes.count ?? 0;
  const todayLog = todayLogRes.data;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-display uppercase tracking-[0.2em] text-muted mb-1">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {greeting}, {profile?.full_name?.split(" ")[0] || profile?.username}
          </h1>
        </div>

        {!todayLog ? (
          <Link href="/log/new">
            <Button size="sm" className="flex-shrink-0">
              <Plus size={14} />
              Log today
            </Button>
          </Link>
        ) : (
          <Link href={`/log/${today}`}>
            <Button variant="ghost" size="sm" className="flex-shrink-0">
              View today
            </Button>
          </Link>
        )}
      </div>

      {/* Today's status banner */}
      {todayLog ? (
        <div className="border border-base bg-surface-raised p-4 flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              todayLog.type === "train"
                ? "bg-brand"
                : todayLog.type === "rest"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
            }`}
          />
          <p className="text-sm">
            Today logged as{" "}
            <span className="font-display font-semibold capitalize">
              {todayLog.type.replace("_", " ")}
            </span>
          </p>
        </div>
      ) : (
        <div className="border border-dashed border-base p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-muted flex-shrink-0" />
          <p className="text-sm text-muted">
            No log yet today — don't break the streak.
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          icon={<Flame size={16} />}
          label="Total logs"
          value={recentLogs.length > 0 ? recentLogs.length.toString() : "0"}
        />
        <StatCard
          icon={<Trophy size={16} />}
          label="Personal records"
          value={String(prCount)}
        />
        <StatCard
          icon={<CalendarDays size={16} />}
          label="This week"
          value={recentLogs
            .filter((l) => {
              const diff = Math.floor(
                (Date.now() - new Date(l.log_date).getTime()) / 86400000,
              );
              return diff < 7;
            })
            .length.toString()}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Recent logs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">
            Recent logs
          </h2>
          <Link
            href="/log/new"
            className="text-xs text-muted hover:text-brand transition-colors font-display"
          >
            + New log
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="border border-dashed border-base p-8 text-center">
            <p className="text-sm text-muted">
              No logs yet. Start by logging today.
            </p>
            <Link href="/log/new" className="mt-3 inline-block">
              <Button size="sm" className="mt-3">
                Log your first day
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Link key={log.id} href={`/log/${log.log_date}`}>
                <div className="group border border-base bg-surface-raised p-4 flex items-center gap-4 hover:border-[hsl(var(--brand-glow)/0.5)] transition-colors">
                  {/* Type indicator */}
                  <div
                    className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                      log.type === "train"
                        ? "bg-brand"
                        : log.type === "rest"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold capitalize">
                        {log.type.replace("_", " ")}
                      </span>
                      {!log.is_public && (
                        <span className="text-xs text-muted border border-base px-1.5 py-0.5 font-display">
                          Private
                        </span>
                      )}
                    </div>
                    {log.comment && (
                      <p className="text-xs text-muted truncate mt-0.5">
                        {log.comment}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-muted font-display flex-shrink-0">
                    {format(new Date(log.log_date + "T12:00:00"), "MMM d")}
                  </span>
                </div>
              </Link>
            ))}
            <WeeklySummary />
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`border border-base bg-surface-raised p-4 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-muted mb-2">
        {icon}
        <span className="text-xs font-display uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
