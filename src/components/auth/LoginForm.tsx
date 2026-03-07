"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState = { error: undefined };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

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
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 px-3 py-2">
          <p className="text-xs text-red-500">{state.error}</p>
        </div>
      )}

      <Button type="submit" loading={pending} size="lg" className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}
