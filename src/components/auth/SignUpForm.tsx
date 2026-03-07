'use client'

import { useActionState } from 'react'
import { signUp } from '@/lib/actions/auth.actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const initialState = { error: undefined }

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initialState)

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        required
      />

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 px-3 py-2">
          <p className="text-xs text-red-500">{state.error}</p>
        </div>
      )}

      <Button type="submit" loading={pending} size="lg" className="mt-2 w-full">
        Create account
      </Button>
    </form>
  )
}