import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'
import { DMClient } from './DMClient'

export default async function DMPage({ params }: { params: { userId: string } }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: otherUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single()

  if (!otherUser) redirect('/feed')

  // Get or create conversation
  const user1_id = user.id < params.userId ? user.id : params.userId
  const user2_id = user.id < params.userId ? params.userId : user.id

  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('user1_id', user1_id)
    .eq('user2_id', user2_id)
    .single()

  if (!conversation) {
    const { data: newConversation } = await supabase
      .from('conversations')
      .insert({ user1_id, user2_id })
      .select()
      .single()
    conversation = newConversation
  }

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*, profiles(*)')
    .eq('conversation_id', conversation?.id)
    .order('created_at', { ascending: true })
    .limit(100)

  return (
    <AppLayout profile={profile}>
      <DMClient
        conversation={conversation}
        otherUser={otherUser}
        initialMessages={messages || []}
        currentUser={profile}
      />
    </AppLayout>
  )
}
