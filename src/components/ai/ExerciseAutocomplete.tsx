'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ExerciseAutocompleteProps {
  name: string
  defaultValue?: string
  placeholder?: string
  error?: string
}

export function ExerciseAutocomplete({
  name,
  defaultValue = '',
  placeholder = 'e.g. Back Squat',
  error,
}: ExerciseAutocompleteProps) {
  const [value, setValue] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/ai/suggest-exercise?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setSuggestions(data.data)
        setOpen(true)
      } else {
        // AI unavailable — just hide suggestions silently
        setSuggestions([])
        setOpen(false)
      }
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400)
  }

  const handleSelect = (s: string) => {
    setValue(s)
    setOpen(false)
    setSuggestions([])
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1.5">
      <label className="text-xs font-display font-semibold uppercase tracking-widest text-muted">
        Exercise
      </label>

      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full bg-surface border border-base px-3 py-2.5 pr-8',
            'text-sm placeholder:text-muted',
            'focus:outline-none focus:border-[hsl(var(--brand-glow))]',
            'transition-colors duration-150',
            error && 'border-red-500'
          )}
        />
        {loading && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <Loader2 size={12} className="animate-spin text-muted" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 border border-base bg-surface-raised shadow-lg mt-0.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="w-full text-left px-3 py-2.5 text-sm font-display hover:bg-[hsl(var(--brand)/0.08)] hover:text-brand transition-colors"
            >
              {s}
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-base">
            <span className="text-xs text-muted font-display flex items-center gap-1">
              AI suggestions
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}