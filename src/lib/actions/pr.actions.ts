'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PRSchema = z.object({
  exercise: z.string().min(1, 'Exercise name required').max(100),
  value: z.coerce.number().positive('Must be a positive number'),
  unit: z.enum(['lbs', 'kg', 'reps', 'seconds', 'minutes']),
  notes: z.string().max(200).optional(),
  is_public: z.boolean().default(false),
  log_id: z.string().uuid().optional(),
  recorded_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type PRFormState = {
  error?: string
  success?: boolean
}

export async function createPR(
  _prev: PRFormState,
  formData: FormData
): Promise<PRFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = PRSchema.safeParse({
    exercise: formData.get('exercise'),
    value: formData.get('value'),
    unit: formData.get('unit'),
    notes: formData.get('notes') || undefined,
    is_public: formData.get('is_public') === 'true',
    log_id: formData.get('log_id') || undefined,
    recorded_at: formData.get('recorded_at'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase
    .from('personal_records')
    .insert({ ...parsed.data, user_id: user.id })

  if (error) return { error: error.message }

  revalidatePath('/prs')
  revalidatePath(`/log/${parsed.data.recorded_at}`)
  return { success: true }
}

export async function deletePR(prId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('personal_records')
    .delete()
    .eq('id', prId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/prs')
  return { success: true }
}