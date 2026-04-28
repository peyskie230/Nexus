import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <AppLayout profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your Nexus preferences</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center py-16">
          <p className="text-4xl mb-4">⚙️</p>
          <p className="text-slate-600 font-medium">More settings coming soon!</p>
          <p className="text-slate-400 text-sm mt-1">Check back later for more options.</p>
        </div>
      </div>
    </AppLayout>
  )
}
