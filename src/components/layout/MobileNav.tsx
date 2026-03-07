'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface MobileNavProps {
  profile: { username: string; full_name: string | null } | null
}

const navItems = [
  { href: '/dashboard', label: 'Home',    icon: LayoutDashboard },
  { href: '/log/new',   label: 'Log',     icon: CalendarDays },
  { href: '/prs',       label: 'Records', icon: Trophy },
  { href: '/profile',   label: 'Profile', icon: User },
]

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-base bg-surface sticky top-0 z-40">
        <span className="font-display font-bold text-base tracking-tight">
          FIT<span className="text-brand">LOG</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">@{profile?.username}</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-base z-40 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3',
                'text-xs font-display font-medium transition-colors',
                active ? 'text-brand' : 'text-muted'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}