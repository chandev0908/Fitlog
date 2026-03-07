'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AICoachProps {
  logType: 'train' | 'rest' | 'active_recovery'
  prs: { exercise: string; value: number; unit: string }[]
  currentComment: string
  onAccept: (suggestion: string) => void
}

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unavailable'

export function AICoach({ logType, prs, currentComment, onAccept }: AICoachProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchSuggestion = async () => {
    setStatus('loading')
    setSuggestion(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/ai/suggest-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logType, prs, existingComment: currentComment }),
      })

      const data = await res.json()

      if (data.success) {
        setSuggestion(data.data)
        setStatus('success')
      } else {
        // Check if AI is simply not configured
        const isUnavailable = data.error?.includes('not configured')
        setErrorMsg(data.error)
        setStatus(isUnavailable ? 'unavailable' : 'error')
      }
    } catch {
      setErrorMsg('Could not reach AI service.')
      setStatus('error')
    }
  }

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion)
      setSuggestion(null)
      setStatus('idle')
    }
  }

  const handleDismiss = () => {
    setSuggestion(null)
    setStatus('idle')
  }

  // Don't render the button at all if AI is confirmed unavailable
  if (status === 'unavailable') return null

  return (
    <div className="space-y-2">
      {/* Trigger button */}
      {(status === 'idle' || status === 'error') && (
        <button
          type="button"
          onClick={fetchSuggestion}
          className={cn(
            'flex items-center gap-2 text-xs font-display font-semibold',
            'transition-colors duration-150',
            status === 'error'
              ? 'text-red-500 hover:text-red-400'
              : 'text-muted hover:text-brand'
          )}
        >
          <Sparkles size={12} />
          {status === 'error' ? 'Try again' : 'Suggest with AI'}
          {status === 'error' && errorMsg && (
            <span className="font-normal text-muted ml-1">— {errorMsg}</span>
          )}
        </button>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-muted font-display">
          <Loader2 size={12} className="animate-spin" />
          Generating suggestion...
        </div>
      )}

      {/* Suggestion card */}
      {status === 'success' && suggestion && (
        <div className={cn(
          'border border-[hsl(var(--brand-glow)/0.3)] bg-[hsl(var(--brand)/0.04)] p-4',
          'space-y-3 animate-in fade-in duration-200'
        )}>
          {/* Header */}
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-brand" />
            <span className="text-xs font-display font-semibold uppercase tracking-widest text-brand">
              AI Suggestion
            </span>
          </div>

          {/* Suggestion text */}
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground)/0.85)] italic">
            "{suggestion}"
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className={cn(
                'flex items-center gap-1.5 text-xs font-display font-semibold',
                'px-3 py-1.5 bg-brand text-white',
                'hover:bg-brand-hover transition-colors'
              )}
            >
              <Check size={11} />
              Use this
            </button>
            <button
              type="button"
              onClick={fetchSuggestion}
              className="flex items-center gap-1.5 text-xs font-display font-semibold text-muted hover:text-brand transition-colors px-2 py-1.5"
            >
              <RefreshCw size={11} />
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex items-center gap-1 text-xs text-muted hover:text-red-500 transition-colors ml-auto"
            >
              <X size={11} />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}