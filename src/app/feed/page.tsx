import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'
import { FeedClient } from './FeedClient'

export default async function FeedPage() {
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
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: likes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)

  const likedPostIds = new Set(likes?.map(l => l.post_id) || [])

  const postsWithLikes = (posts || []).map(post => ({
    ...post,
    user_has_liked: likedPostIds.has(post.id)
  }))

  return (
    <AppLayout profile={profile}>
      <FeedClient initialPosts={postsWithLikes} currentUser={profile} />
    </AppLayout>
  )
}
