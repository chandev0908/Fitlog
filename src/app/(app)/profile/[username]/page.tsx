import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PublicLogCard } from '@/components/profile/PublicLogCard'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get the viewer (may be null if not logged in — but middleware protects this route)
  const { data: { user: viewer } } = await supabase.auth.getUser()

  // Fetch the profile being viewed
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, is_public, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Private profile — only owner can see it
  const isOwner = viewer?.id === profile.id
  if (!profile.is_public && !isOwner) notFound()

  // Fetch public logs (or all logs if owner)
  const logsQuery = supabase
    .from('logs')
    .select('id, log_date, type, comment, is_public, created_at')
    .eq('user_id', profile.id)
    .order('log_date', { ascending: false })
    .limit(20)

  if (!isOwner) logsQuery.eq('is_public', true)

  const { data: logs } = await logsQuery

  // Fetch public PRs
  const prsQuery = supabase
    .from('personal_records')
    .select('id, exercise, value, unit, recorded_at')
    .eq('user_id', profile.id)
    .order('recorded_at', { ascending: false })

  if (!isOwner) prsQuery.eq('is_public', true)

  const { data: prs } = await prsQuery

  // Best PR per exercise
  type PR = NonNullable<typeof prs>[number]
  const bestPRs = Object.values(
    (prs ?? []).reduce<Record<string, PR>>((acc, pr) => {
      if (!acc[pr.exercise] || pr.value > acc[pr.exercise].value) {
        acc[pr.exercise] = pr
      }
      return acc
    }, {})
  ).slice(0, 6) // show top 6 on profile

  const totalLogs = logs?.length ?? 0
  const trainDays = logs?.filter(l => l.type === 'train').length ?? 0

  return (
    <div className="space-y-10">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        stats={{ totalLogs, trainDays, prCount: prs?.length ?? 0 }}
      />

      {/* PRs showcase */}
      {bestPRs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
            Top Records
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {bestPRs.map((pr) => (
              <div
                key={pr.id}
                className="border border-base bg-surface p-3 space-y-1"
              >
                <p className="text-xs text-muted font-display truncate">{pr.exercise}</p>
                <p className="font-display text-xl font-bold tabular-nums">
                  {pr.value}
                  <span className="text-xs font-normal text-muted ml-1">{pr.unit}</span>
                </p>
                <p className="text-xs text-muted">
                  {format(new Date(pr.recorded_at + 'T12:00:00'), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Logs feed */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
          {isOwner ? 'All Logs' : 'Public Logs'}
        </h2>

        {!logs?.length ? (
          <div className="border border-dashed border-base p-10 text-center">
            <p className="text-sm text-muted">
              {isOwner ? 'No logs yet. Start logging!' : 'No public logs yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <PublicLogCard
                key={log.id}
                log={log}
                username={profile.username}
                isOwner={isOwner}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}