'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileFormState } from '@/lib/actions/profile.actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface SettingsFormProps {
  profile: {
    username: string
    full_name: string | null
    bio: string | null
    is_public: boolean
  }
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [isPublic, setIsPublic] = useState(profile.is_public)

  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    {}
  )

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="is_public" value={String(isPublic)} />

      <Input
        label="Username"
        name="username"
        defaultValue={profile.username}
        placeholder="your_username"
        error={state?.fieldErrors?.username}
        hint="Lowercase letters, numbers, underscores only"
      />

      <Input
        label="Display Name"
        name="full_name"
        defaultValue={profile.full_name ?? ''}
        placeholder="Your Name"
        error={state?.fieldErrors?.full_name}
      />

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-display font-semibold uppercase tracking-widest text-muted">
          Bio
        </label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ''}
          placeholder="Tell others about your training..."
          maxLength={160}
          className={cn(
            'w-full bg-surface border border-base px-3 py-2.5 resize-none',
            'text-sm placeholder:text-muted',
            'focus:outline-none focus:border-[hsl(var(--brand-glow))]',
            'transition-colors duration-150',
            state?.fieldErrors?.bio && 'border-red-500'
          )}
        />
        {state?.fieldErrors?.bio && (
          <p className="text-xs text-red-500">{state.fieldErrors.bio}</p>
        )}
      </div>

      {/* Public profile toggle */}
      <button
        type="button"
        onClick={() => setIsPublic(!isPublic)}
        className="flex items-center gap-3"
      >
        <div className={cn(
          'w-9 h-5 rounded-full border transition-all duration-200 relative',
          isPublic ? 'bg-[hsl(var(--brand))] border-[hsl(var(--brand))]' : 'bg-surface border-base'
        )}>
          <span className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
            isPublic ? 'left-4' : 'left-0.5'
          )} />
        </div>
        <div className="text-left">
          <p className="font-display text-sm font-semibold flex items-center gap-1.5">
            {isPublic
              ? <><Eye size={13} className="text-brand" /> Public profile</>
              : <><EyeOff size={13} className="text-muted" /> Private profile</>
            }
          </p>
          <p className="text-xs text-muted">
            {isPublic ? 'Anyone can view your profile' : 'Only you can see your profile'}
          </p>
        </div>
      </button>

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 px-3 py-2">
          <p className="text-xs text-red-500">{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="bg-[hsl(var(--brand)/0.1)] border border-[hsl(var(--brand-glow)/0.3)] px-3 py-2 flex items-center gap-2">
          <Check size={12} className="text-brand" />
          <p className="text-xs text-brand font-display font-semibold">Profile updated</p>
        </div>
      )}

      <Button type="submit" loading={pending}>
        Save changes
      </Button>
    </form>
  )
}