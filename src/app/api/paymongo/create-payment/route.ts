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

    const secretKey = process.env.PAYMONGO_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'PayMongo key not configured' }, { status: 500 })
    }

    const encodedKey = Buffer.from(secretKey + ':').toString('base64')

    const paymongoBody = {
      data: {
        attributes: {
          amount: amount,
          description: `Nexus Sticker Pack — ${packName}`,
          remarks: `${user.id}|${packId}`
        }
      }
    }

    console.log('PayMongo request:', JSON.stringify(paymongoBody))
    console.log('Using key prefix:', secretKey.substring(0, 10))

    const response = await fetch('https://api.paymongo.com/v1/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      },
      body: JSON.stringify(paymongoBody)
    })

    const paymongoData = await response.json()
    console.log('PayMongo response:', JSON.stringify(paymongoData))

    if (!response.ok) {
      return NextResponse.json({
        error: paymongoData.errors?.[0]?.detail || 'Payment creation failed',
        details: paymongoData
      }, { status: 400 })
    }

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

  } catch (error: unknown) {
    console.error('Payment error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
