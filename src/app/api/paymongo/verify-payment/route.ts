import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId, packId } = await request.json()

    // Check payment status from PayMongo
    const response = await fetch(`https://api.paymongo.com/v1/links/${paymentId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      }
    })

    const paymongoData = await response.json()
    const status = paymongoData.data?.attributes?.status

    if (status === 'paid') {
      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'paid' })
        .eq('paymongo_payment_id', paymentId)
        .eq('user_id', user.id)

      // Give user access to the sticker pack
      await supabase
        .from('user_sticker_packs')
        .upsert({
          user_id: user.id,
          pack_id: packId
        })

      return NextResponse.json({ success: true, status: 'paid' })
    }

    return NextResponse.json({ success: false, status: status || 'pending' })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
