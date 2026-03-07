import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogForm } from '@/components/log/LogForm'
import { format } from 'date-fns'

export default async function NewLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = format(new Date(), 'yyyy-MM-dd')

  // Check if log already exists for today
  const { data: existingLog } = await supabase
    .from('logs')
    .select('id, type, comment, is_public')
    .eq('user_id', user.id)
    .eq('log_date', today)
    .maybeSingle()

  // If log exists, redirect to the log view/edit page
  if (existingLog) redirect(`/log/${today}`)

  return (
    <LogForm
      userId={user.id}
      logDate={today}
      existingLog={null}
      existingPRs={[]}
      existingImages={[]}
    />
  )
}