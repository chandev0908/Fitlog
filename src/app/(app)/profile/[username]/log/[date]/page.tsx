import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Image from 'next/image'
import { Trophy, Lock } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ username: string; date: string }>
}

export default async function PublicLogViewPage({ params }: PageProps) {
  const { username, date } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const supabase = await createClient()
  const { data: { user: viewer } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, is_public')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwner = viewer?.id === profile.id

  const { data: log } = await supabase
    .from('logs')
    .select('id, log_date, type, comment, is_public')
    .eq('user_id', profile.id)
    .eq('log_date', date)
    .maybeSingle()

  if (!log) notFound()
  if (!log.is_public && !isOwner) notFound()

  // Fetch PRs and images for this log
  const [prsRes, imagesRes] = await Promise.all([
    supabase
      .from('personal_records')
      .select('id, exercise, value, unit, notes')
      .eq('log_id', log.id)
      .eq('is_public', isOwner ? undefined as unknown as boolean : true),

    supabase
      .from('log_images')
      .select('id, storage_path, caption')
      .eq('log_id', log.id),
  ])

  // Generate signed URLs for images
  const images = await Promise.all(
    (imagesRes.data ?? []).map(async (img) => {
      const { data } = await supabase.storage
        .from('log-images')
        .createSignedUrl(img.storage_path, 3600)
      return { ...img, publicUrl: data?.signedUrl ?? '' }
    })
  )

  const TYPE_LABELS: Record<string, string> = {
    train: 'Train Day',
    rest: 'Rest Day',
    active_recovery: 'Active Recovery',
  }

  const TYPE_COLORS: Record<string, string> = {
    train: 'bg-[hsl(var(--brand-glow))]',
    rest: 'bg-yellow-500',
    active_recovery: 'bg-blue-400',
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Back link */}
      <Link
        href={`/profile/${username}`}
        className="text-xs text-muted hover:text-brand font-display transition-colors flex items-center gap-1"
      >
        ← Back to @{username}
      </Link>

      {/* Log header */}
      <div className="flex items-start gap-4">
        <div className={`w-1.5 h-14 rounded-full flex-shrink-0 mt-1 ${TYPE_COLORS[log.type] ?? 'bg-muted'}`} />
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-1">
            {format(new Date(log.log_date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {TYPE_LABELS[log.type] ?? log.type}
          </h1>
          <p className="text-sm text-muted mt-1">by @{username}</p>
        </div>
      </div>

      {/* Comment */}
      {log.comment && (
        <div className="border-l-2 border-[hsl(var(--brand-glow)/0.4)] pl-4">
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground)/0.85)]">
            {log.comment}
          </p>
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted">
            Photos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square border border-base overflow-hidden">
                <Image
                  src={img.publicUrl}
                  alt={img.caption || 'Log photo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRs */}
      {(prsRes.data?.length ?? 0) > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted flex items-center gap-2">
            <Trophy size={12} className="text-yellow-500" />
            Personal Records
          </h2>
          <div className="space-y-1.5">
            {prsRes.data?.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center gap-3 px-4 py-3 border border-base bg-surface"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                <span className="font-display text-sm font-semibold flex-1">{pr.exercise}</span>
                <span className="font-display text-sm font-bold tabular-nums">
                  {pr.value} <span className="text-xs font-normal text-muted">{pr.unit}</span>
                </span>
                {pr.notes && (
                  <span className="text-xs text-muted hidden sm:block">{pr.notes}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* If no content at all */}
      {!log.comment && images.length === 0 && (prsRes.data?.length ?? 0) === 0 && (
        <div className="border border-dashed border-base p-8 text-center">
          <p className="text-sm text-muted">Nothing else shared for this day.</p>
        </div>
      )}
    </div>
  )
}