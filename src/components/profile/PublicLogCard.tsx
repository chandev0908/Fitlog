'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PublicLogCardProps {
  log: {
    id: string
    log_date: string
    type: string
    comment: string | null
    is_public: boolean
  }
  username: string
  isOwner: boolean
}

const TYPE_STYLES: Record<string, { bar: string; label: string }> = {
  train:           { bar: 'bg-[hsl(var(--brand-glow))]', label: 'Train' },
  rest:            { bar: 'bg-yellow-500',                label: 'Rest' },
  active_recovery: { bar: 'bg-blue-400',                  label: 'Active' },
}

export function PublicLogCard({ log, username, isOwner }: PublicLogCardProps) {
  const style = TYPE_STYLES[log.type] ?? TYPE_STYLES.train
  const href = isOwner ? `/log/${log.log_date}` : `/profile/${username}/log/${log.log_date}`

  return (
    <Link href={href}>
      <div className={cn(
        'group flex items-stretch gap-0 border border-base bg-surface-raised',
        'hover:border-[hsl(var(--brand-glow)/0.4)] transition-colors duration-150'
      )}>
        {/* Color bar */}
        <div className={cn('w-1 flex-shrink-0', style.bar)} />

        <div className="flex-1 px-4 py-3 flex items-center gap-4 min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold">{style.label}</span>
              {!log.is_public && isOwner && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Lock size={10} /> Private
                </span>
              )}
            </div>
            {log.comment && (
              <p className="text-xs text-muted truncate mt-0.5 max-w-sm">{log.comment}</p>
            )}
          </div>

          <span className="text-xs text-muted font-display flex-shrink-0">
            {format(new Date(log.log_date + 'T12:00:00'), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Link>
  )
}