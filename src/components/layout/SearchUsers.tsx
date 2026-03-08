'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Loader2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

type UserResult = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export function SearchUsers() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.users ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setSelected(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (username: string) => {
    router.push(`/profile/${username}`)
    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    setQuery('')
    setResults([])
    setSelected(-1)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(s => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(s => Math.max(s - 1, -1))
    } else if (e.key === 'Enter' && selected >= 0) {
      handleSelect(results[selected].username)
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Global keyboard shortcut — Ctrl+K or Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Trigger button — shown in sidebar and mobile nav */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 w-full',
          'text-sm font-display font-medium text-muted',
          'hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-raised))]',
          'transition-colors duration-100'
        )}
      >
        <Search size={16} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 text-xs border border-base px-1.5 py-0.5 font-display opacity-50">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Search panel */}
          <div
            ref={wrapperRef}
            className="relative w-full max-w-md bg-surface-raised border border-base shadow-2xl"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-base">
              {loading
                ? <Loader2 size={16} className="text-muted animate-spin flex-shrink-0" />
                : <Search size={16} className="text-muted flex-shrink-0" />
              }
              <input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by username or name..."
                className={cn(
                  'flex-1 bg-transparent text-sm placeholder:text-muted',
                  'focus:outline-none font-display'
                )}
              />
              {query && (
                <button onClick={handleClose} className="text-muted hover:text-[hsl(var(--foreground))]">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="py-1 max-h-72 overflow-y-auto">
                {results.map((user, i) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user.username)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left',
                      selected === i
                        ? 'bg-[hsl(var(--brand)/0.1)]'
                        : 'hover:bg-surface'
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-base">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.username}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[hsl(var(--brand)/0.15)]">
                          <span className="text-xs font-display font-bold text-brand uppercase">
                            {user.username[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold truncate">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-xs text-muted truncate">@{user.username}</p>
                    </div>

                    {selected === i && (
                      <kbd className="text-xs text-muted border border-base px-1.5 py-0.5 font-display">
                        ↵
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {query.length >= 2 && !loading && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <User size={24} className="text-muted mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted font-display">No users found for "{query}"</p>
                <p className="text-xs text-muted mt-1 opacity-70">Only public profiles appear in search</p>
              </div>
            )}

            {/* Hint when empty */}
            {query.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-muted font-display">
                  Type at least 2 characters to search
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-base flex items-center gap-3">
              <span className="text-xs text-muted font-display flex items-center gap-1">
                <kbd className="border border-base px-1 py-0.5">↑↓</kbd> navigate
              </span>
              <span className="text-xs text-muted font-display flex items-center gap-1">
                <kbd className="border border-base px-1 py-0.5">↵</kbd> select
              </span>
              <span className="text-xs text-muted font-display flex items-center gap-1">
                <kbd className="border border-base px-1 py-0.5">esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}