import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// /profile always redirects to the user's own public profile
export default async function ProfileRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/settings')

  redirect(`/profile/${profile.username}`)
}