"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  User,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { signOut } from "@/lib/actions/auth.actions";
import { SearchUsers } from "./SearchUsers";

interface SidebarProps {
  profile: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log/new", label: "Log Day", icon: CalendarDays },
  { href: "/prs", label: "Records", icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] flex-col bg-surface border-r border-base z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-base">
        <span className="font-display font-bold text-lg tracking-tight">
          FIT<span className="text-brand">LOG</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        <SearchUsers />
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-display font-medium",
                "transition-colors duration-100",
                active
                  ? "bg-[hsl(var(--brand)/0.12)] text-brand"
                  : "text-muted hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-raised))]",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-base space-y-1">
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[hsl(var(--brand)/0.2)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-display font-bold text-brand uppercase">
              {profile?.username?.[0] ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-display font-semibold truncate">
              {profile?.full_name || profile?.username}
            </p>
            <p className="text-xs text-muted truncate">@{profile?.username}</p>
          </div>
          <ThemeToggle className="ml-auto flex-shrink-0" />
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-display font-medium text-muted hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
