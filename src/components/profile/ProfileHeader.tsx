import Link from 'next/link'
import Image from 'next/image'
import { Settings, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

interface ProfileHeaderProps {
  profile: {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    avatar_url: string | null
    is_public: boolean
    created_at: string
  }
  isOwner: boolean
  stats: {
    totalLogs: number
    trainDays: number
    prCount: number
  }
}

export function ProfileHeader({ profile, isOwner, stats }: ProfileHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top row */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-base">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--brand)/0.15)]">
              <span className="font-display font-bold text-2xl text-brand">
                {profile.username[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl md:text-2xl font-bold truncate">
              {profile.full_name || profile.username}
            </h1>
            {!profile.is_public && (
              <span className="flex items-center gap-1 text-xs text-muted border border-base px-2 py-0.5 font-display">
                <Lock size={10} /> Private
              </span>
            )}
          </div>
          <p className="text-sm text-muted font-display">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm mt-2 text-[hsl(var(--foreground)/0.8)] leading-relaxed max-w-md">
              {profile.bio}
            </p>
          )}
          <p className="text-xs text-muted mt-2 font-display">
            Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
          </p>
        </div>

        {/* Edit button for owner */}
        {isOwner && (
          <Link href="/settings" className="flex-shrink-0">
            <Button variant="ghost" size="sm">
              <Settings size={13} />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border border-base divide-x divide-[hsl(var(--border))]">
        {[
          { label: 'Total Logs', value: stats.totalLogs },
          { label: 'Train Days', value: stats.trainDays },
          { label: 'Records', value: stats.prCount },
        ].map(({ label, value }) => (
          <div key={label} className="py-4 text-center">
            <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted font-display uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}