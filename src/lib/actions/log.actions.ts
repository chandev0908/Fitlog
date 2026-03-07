'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const LogSchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  type: z.enum(['train', 'rest', 'active_recovery']),
  comment: z.string().max(500).optional(),
  is_public: z.boolean().default(false),
})

export type LogFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
  logId?: string
}

export async function upsertLog(
  _prev: LogFormState,
  formData: FormData
): Promise<LogFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const raw = {
    log_date: formData.get('log_date') as string,
    type: formData.get('type') as string,
    comment: formData.get('comment') as string || undefined,
    is_public: formData.get('is_public') === 'true',
  }

  const parsed = LogSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach(i => {
      if (i.path[0]) fieldErrors[i.path[0] as string] = i.message
    })
    return { fieldErrors }
  }

  const { data, error } = await supabase
    .from('logs')
    .upsert(
      { ...parsed.data, user_id: user.id },
      { onConflict: 'user_id,log_date' }
    )
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/log/${parsed.data.log_date}`)

  redirect(`/log/${parsed.data.log_date}`)
}

export async function deleteLog(logId: string, logDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', user.id) // double-check ownership even with RLS

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}