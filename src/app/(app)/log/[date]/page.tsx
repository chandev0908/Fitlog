import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogForm } from '@/components/log/LogForm'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function LogDatePage({ params }: PageProps) {
  const { date } = await params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: log } = await supabase
    .from('logs')
    .select('id, type, comment, is_public')
    .eq('user_id', user.id)
    .eq('log_date', date)
    .maybeSingle()

  if (!log) redirect(`/log/new`)

  const [prsRes, imagesRes] = await Promise.all([
    supabase
      .from('personal_records')
      .select('id, exercise, value, unit, notes')
      .eq('log_id', log.id)
      .order('created_at', { ascending: true }),

    supabase
      .from('log_images')
      .select('id, storage_path, caption')
      .eq('log_id', log.id)
      .order('created_at', { ascending: true }),
  ])

  const images = await Promise.all(
    (imagesRes.data ?? []).map(async (img) => {
      const { data } = await supabase.storage
        .from('log-images')
        .createSignedUrl(img.storage_path, 3600)
      return {
        ...img,
        publicUrl: data?.signedUrl ?? '',
      }
    })
  )

  return (
    <LogForm
      userId={user.id}
      logDate={date}
      existingLog={log}
      existingPRs={prsRes.data ?? []}
      existingImages={images}
    />
  )
}