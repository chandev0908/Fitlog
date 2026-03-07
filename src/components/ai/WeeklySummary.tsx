'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function WeeklySummary() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [summary, setSummary] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchSummary = async () => {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/ai/weekly-summary')
      const text = await res.text()

      let data: { success: boolean; data?: string; error?: string }
      try {
        data = JSON.parse(text)
      } catch {
        setErrorMsg(`Server error: ${text.slice(0, 100)}`)
        setStatus('error')
        return
      }

      if (data.success) {
        setSummary(data.data ?? '')
        setStatus('success')
        setExpanded(true)
      } else {
        setErrorMsg(data.error ?? 'Unknown error')
        setStatus('error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reach AI service.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  return (
    <div className="border border-base bg-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-brand" />
          <span className="font-display text-xs font-semibold uppercase tracking-widest">
            Weekly AI Summary
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === 'success' && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-muted hover:text-[hsl(var(--foreground))] transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button
            type="button"
            onClick={fetchSummary}
            disabled={status === 'loading'}
            className={cn(
              'text-xs font-display font-semibold px-3 py-1.5 border transition-colors',
              status === 'loading'
                ? 'border-base text-muted cursor-not-allowed'
                : 'border-[hsl(var(--brand-glow)/0.4)] text-brand hover:bg-[hsl(var(--brand)/0.08)]'
            )}
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={11} className="animate-spin" />
                Analyzing...
              </span>
            ) : status === 'success' ? (
              'Refresh'
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>

      {status === 'idle' && (
        <div className="px-4 py-4">
          <p className="text-xs text-muted font-display">
            Get an AI-powered summary of your training week — consistency, highlights, and what to focus on next.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="px-4 py-3">
          <p className="text-xs text-red-500">{errorMsg}</p>
        </div>
      )}

      {status === 'success' && summary && expanded && (
        <div className="px-4 py-4 space-y-2">
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground)/0.85)]">
            {summary}
          </p>
          <p className="text-xs text-muted font-display">
            Based on your logs this week · AI-generated
          </p>
        </div>
      )}
    </div>
  )
}