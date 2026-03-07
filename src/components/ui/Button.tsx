import { cn } from '@/lib/utils/cn'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center font-display font-semibold',
          'transition-all duration-150 select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Sizes
          size === 'sm' && 'text-xs px-3 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2.5 gap-2',
          size === 'lg' && 'text-base px-6 py-3 gap-2',
          // Variants
          variant === 'primary' && [
            'bg-brand text-white',
            'hover:bg-brand-hover active:scale-[0.98]',
            'shadow-[0_0_0_0_hsl(var(--brand-glow)/0)]',
            'hover:shadow-[0_0_16px_0_hsl(var(--brand-glow)/0.3)]',
          ],
          variant === 'ghost' && [
            'bg-transparent text-[hsl(var(--foreground))]',
            'border border-[hsl(var(--border))]',
            'hover:bg-[hsl(var(--surface))] active:scale-[0.98]',
          ],
          variant === 'danger' && [
            'bg-red-600 text-white',
            'hover:bg-red-700 active:scale-[0.98]',
          ],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
            <span className="opacity-0">{children}</span>
          </>
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'