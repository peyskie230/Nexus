import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppLayout } from '@/components/shared/AppLayout'
import { ShopClient } from './ShopClient'

export default async function ShopPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: packs } = await supabase
    .from('sticker_packs')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: userPacks } = await supabase
    .from('user_sticker_packs')
    .select('pack_id')
    .eq('user_id', user.id)

  const ownedPackIds = new Set(userPacks?.map(p => p.pack_id) || [])

  return (
    <AppLayout profile={profile}>
      <ShopClient
        packs={packs || []}
        ownedPackIds={Array.from(ownedPackIds)}
        currentUser={profile}
      />
    </AppLayout>
  )
}
