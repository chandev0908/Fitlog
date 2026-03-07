import { SignUpForm } from '@/components/auth/SignUpForm'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-2">
          Start tracking
        </p>
        <h1 className="font-display text-3xl font-bold">Create account</h1>
      </div>

      <SignUpForm />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[hsl(var(--foreground))] underline underline-offset-4 hover:text-brand transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}