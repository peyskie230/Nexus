import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'
import { ProfileClient } from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout profile={profile}>
      <ProfileClient
        initialProfile={profile}
        initialPosts={posts || []}
        userEmail={user.email || ''}
      />
    </AppLayout>
  )
}
