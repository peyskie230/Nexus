import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'
import { ChatRoomClient } from './ChatRoomClient'

export default async function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: room } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('id', params.roomId)
    .single()

  if (!room) redirect('/chat')

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(*)')
    .eq('room_id', params.roomId)
    .order('created_at', { ascending: true })
    .limit(100)

  return (
    <AppLayout profile={profile}>
      <ChatRoomClient
        room={room}
        initialMessages={messages || []}
        currentUser={profile}
      />
    </AppLayout>
  )
}
