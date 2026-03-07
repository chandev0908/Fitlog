import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/profile/SettingsForm'
import { AvatarUploader } from '@/components/profile/AvatarUploader'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, bio, avatar_url, is_public')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="space-y-10 max-w-lg">
      {/* Header */}
      <div>
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted mb-1">
          Account
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Settings</h1>
      </div>

      {/* Avatar section */}
      <section className="space-y-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted border-b border-base pb-2">
          Profile Photo
        </h2>
        <AvatarUploader
          userId={user.id}
          currentUrl={profile.avatar_url}
          username={profile.username}
          size="lg"
        />
      </section>

      {/* Profile info section */}
      <section className="space-y-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted border-b border-base pb-2">
          Profile Info
        </h2>
        <SettingsForm profile={profile} />
      </section>

      {/* Danger zone */}
      <section className="space-y-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-red-500/70 border-b border-red-500/20 pb-2">
          Danger Zone
        </h2>
        <div className="border border-red-500/20 p-4 space-y-2">
          <p className="text-sm font-display font-semibold">Delete Account</p>
          <p className="text-xs text-muted">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <p className="text-xs text-muted italic">Contact support to delete your account.</p>
        </div>
      </section>
    </div>
  )
}