'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StandalonePRForm } from '@/components/pr/StandalonePRForm'
import { deletePR } from '@/lib/actions/pr.actions'
import { Trophy, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/cn'

type PR = {
  id: string
  exercise: string
  value: number
  unit: string
  notes: string | null
  recorded_at: string
  is_public: boolean
  log_id: string | null
}

export default function PRsPage() {
  const [prs, setPRs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const supabase = createClient()

  const fetchPRs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('personal_records')
      .select('id, exercise, value, unit, notes, recorded_at, is_public, log_id')
      .order('recorded_at', { ascending: false })
    setPRs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPRs() }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deletePR(id)
    setPRs(prev => prev.filter(p => p.id !== id))
    setDeletingId(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchPRs()
  }

  // Group by exercise, find best per exercise
  type PRGroup = { best: PR; history: PR[] }
  const grouped = prs.reduce<Record<string, PRGroup>>((acc, pr) => {
    if (!acc[pr.exercise]) {
      acc[pr.exercise] = { best: pr, history: [pr] }
    } else {
      acc[pr.exercise].history.push(pr)
      if (pr.value > acc[pr.exercise].best.value) {
        acc[pr.exercise].best = pr
      }
    }
    return acc
  }, {})

  const exercises = Object.entries(grouped).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-1">
            All time
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Personal Records
          </h1>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'ghost' : 'primary'}
          className="flex-shrink-0"
        >
          <Plus size={14} />
          Add PR
        </Button>
      </div>

      {/* Add PR form */}
      {showForm && (
        <div className="border border-[hsl(var(--brand-glow)/0.3)] bg-[hsl(var(--brand)/0.04)] p-5">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted mb-4">
            New Personal Record
          </p>
          <StandalonePRForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-base bg-surface p-4 animate-pulse h-14" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && prs.length === 0 && (
        <div className="border border-dashed border-base p-12 text-center">
          <Trophy size={32} className="text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted font-display">No PRs yet.</p>
          <p className="text-xs text-muted mt-1">
            Click "Add PR" to log your first personal record.
          </p>
        </div>
      )}

      {/* PR list grouped by exercise */}
      {!loading && exercises.length > 0 && (
        <div className="space-y-1.5">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-4 pb-1">
            <span className="col-span-5 text-xs font-display font-semibold uppercase tracking-widest text-muted">
              Exercise
            </span>
            <span className="col-span-3 text-xs font-display font-semibold uppercase tracking-widest text-muted">
              Best
            </span>
            <span className="col-span-3 text-xs font-display font-semibold uppercase tracking-widest text-muted">
              Date
            </span>
          </div>

          {exercises.map(([exercise, { best, history }]) => {
            const isExpanded = expandedExercise === exercise
            const hasHistory = history.length > 1

            return (
              <div key={exercise} className="border border-base bg-surface-raised">
                {/* Best row */}
                <div className="grid grid-cols-12 gap-2 items-center px-4 py-3">
                  <div className="col-span-5 flex items-center gap-2 min-w-0">
                    <Trophy size={12} className="text-yellow-500 flex-shrink-0" />
                    <span className="font-display text-sm font-semibold truncate">
                      {exercise}
                    </span>
                    {hasHistory && (
                      <span className="text-xs text-muted font-display flex-shrink-0">
                        ×{history.length}
                      </span>
                    )}
                  </div>

                  <div className="col-span-3">
                    <span className="font-display text-sm font-bold tabular-nums">
                      {best.value}
                    </span>
                    <span className="text-xs text-muted ml-1">{best.unit}</span>
                  </div>

                  <div className="col-span-3">
                    <span className="text-xs text-muted font-display">
                      {format(new Date(best.recorded_at + 'T12:00:00'), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {hasHistory && (
                      <button
                        onClick={() => setExpandedExercise(isExpanded ? null : exercise)}
                        className="text-muted hover:text-brand transition-colors"
                      >
                        {isExpanded
                          ? <ChevronUp size={14} />
                          : <ChevronDown size={14} />
                        }
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(best.id)}
                      disabled={deletingId === best.id}
                      className="text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* History rows */}
                {isExpanded && hasHistory && (
                  <div className="border-t border-base divide-y divide-[hsl(var(--border))]">
                    {history.map((pr) => (
                      <div
                        key={pr.id}
                        className={cn(
                          'grid grid-cols-12 gap-2 items-center px-4 py-2.5',
                          'bg-surface',
                          pr.id === best.id && 'bg-[hsl(var(--brand)/0.04)]'
                        )}
                      >
                        <div className="col-span-5 pl-5 flex items-center gap-2">
                          {pr.id === best.id && (
                            <span className="text-xs text-brand font-display font-semibold">
                              best
                            </span>
                          )}
                          {pr.notes && (
                            <span className="text-xs text-muted truncate">{pr.notes}</span>
                          )}
                        </div>

                        <div className="col-span-3">
                          <span className="font-display text-sm tabular-nums">
                            {pr.value}
                          </span>
                          <span className="text-xs text-muted ml-1">{pr.unit}</span>
                        </div>

                        <div className="col-span-3">
                          <span className="text-xs text-muted font-display">
                            {format(new Date(pr.recorded_at + 'T12:00:00'), 'MMM d, yyyy')}
                          </span>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => handleDelete(pr.id)}
                            disabled={deletingId === pr.id}
                            className="text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}