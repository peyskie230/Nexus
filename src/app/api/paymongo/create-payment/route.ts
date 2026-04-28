import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packId, packName, amount } = await request.json()

    // Create PayMongo payment link
    const response = await fetch('https://api.paymongo.com/v1/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount,
            description: `Nexus Sticker Pack — ${packName}`,
            remarks: `${user.id}|${packId}`
          }
        }
      })
    })

    const paymongoData = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'Payment creation failed' }, { status: 400 })
    }

    // Save payment record to database
    await supabase.from('payments').insert({
      user_id: user.id,
      pack_id: packId,
      paymongo_payment_id: paymongoData.data.id,
      amount: amount,
      status: 'pending'
    })

    return NextResponse.json({
      checkoutUrl: paymongoData.data.attributes.checkout_url,
      paymentId: paymongoData.data.id
    })

  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
