'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ProfileSchema = z.object({
  full_name: z.string().max(60).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  bio: z.string().max(160, 'Bio must be under 160 characters').optional(),
  is_public: z.boolean().default(true),
})

export type ProfileFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = ProfileSchema.safeParse({
    full_name: formData.get('full_name') || undefined,
    username: formData.get('username'),
    bio: formData.get('bio') || undefined,
    is_public: formData.get('is_public') === 'true',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach(i => {
      if (i.path[0]) fieldErrors[i.path[0] as string] = i.message
    })
    return { fieldErrors }
  }

  // Check username uniqueness (excluding self)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', parsed.data.username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) return { fieldErrors: { username: 'Username already taken' } }

  const { error } = await supabase
    .from('profiles')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath(`/profile/${parsed.data.username}`)
  return { success: true }
}

export async function updateAvatar(storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(storagePath)

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/settings')
  return { success: true }
}