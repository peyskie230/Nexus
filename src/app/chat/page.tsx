import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'
import { ChatRoomsClient } from './ChatRoomsClient'

export default async function ChatPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <AppLayout profile={profile}>
      <ChatRoomsClient initialRooms={rooms || []} currentUser={profile} />
    </AppLayout>
  )
}
