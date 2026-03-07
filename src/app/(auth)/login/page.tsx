import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-2">
          Welcome back
        </p>
        <h1 className="font-display text-3xl font-bold">Sign in</h1>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-muted">
        No account?{' '}
        <Link
          href="/signup"
          className="text-[hsl(var(--foreground))] underline underline-offset-4 hover:text-brand transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}