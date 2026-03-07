'use client'

import { cn } from '@/lib/utils/cn'
import { Dumbbell, BedDouble, Activity } from 'lucide-react'

type LogType = 'train' | 'rest' | 'active_recovery'

interface LogTypeSelectorProps {
  value: LogType
  onChange: (val: LogType) => void
}

const options: {
  value: LogType
  label: string
  sublabel: string
  icon: React.ReactNode
  activeClass: string
  dotClass: string
}[] = [
  {
    value: 'train',
    label: 'Train',
    sublabel: 'Hard session',
    icon: <Dumbbell size={18} />,
    activeClass: 'border-[hsl(var(--brand-glow))] bg-[hsl(var(--brand)/0.08)]',
    dotClass: 'bg-[hsl(var(--brand-glow))]',
  },
  {
    value: 'rest',
    label: 'Rest',
    sublabel: 'Full recovery',
    icon: <BedDouble size={18} />,
    activeClass: 'border-yellow-500 bg-yellow-500/8',
    dotClass: 'bg-yellow-500',
  },
  {
    value: 'active_recovery',
    label: 'Active',
    sublabel: 'Light movement',
    icon: <Activity size={18} />,
    activeClass: 'border-blue-400 bg-blue-400/8',
    dotClass: 'bg-blue-400',
  },
]

export function LogTypeSelector({ value, onChange }: LogTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative flex flex-col items-center gap-2 p-4 border transition-all duration-150',
              'hover:bg-surface-raised focus:outline-none',
              active ? opt.activeClass : 'border-base bg-surface'
            )}
          >
            {active && (
              <span className={cn('absolute top-2 right-2 w-1.5 h-1.5 rounded-full', opt.dotClass)} />
            )}
            <span className={cn('transition-colors', active ? 'text-[hsl(var(--foreground))]' : 'text-muted')}>
              {opt.icon}
            </span>
            <div className="text-center">
              <p className={cn('font-display text-sm font-semibold', active ? '' : 'text-muted')}>
                {opt.label}
              </p>
              <p className="text-xs text-muted">{opt.sublabel}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}