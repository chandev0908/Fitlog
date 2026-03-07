'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteImage(imageId: string, storagePath: string, logDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Delete from storage first
  const { error: storageError } = await supabase.storage
    .from('log-images')
    .remove([storagePath])

  if (storageError) return { error: storageError.message }

  // Then delete the DB record
  const { error: dbError } = await supabase
    .from('log_images')
    .delete()
    .eq('id', imageId)
    .eq('user_id', user.id)

  if (dbError) return { error: dbError.message }

  revalidatePath(`/log/${logDate}`)
  return { success: true }
}