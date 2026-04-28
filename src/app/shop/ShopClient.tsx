'use client'

import { useState } from 'react'
import { ShoppingBag, Check, Loader2, Tag } from 'lucide-react'
import { Profile } from '@/lib/types'

interface StickerPack {
  id: string
  name: string
  description: string | null
  price: number
  preview_url: string | null
  created_at: string
}

interface ShopClientProps {
  packs: StickerPack[]
  ownedPackIds: string[]
  currentUser: Profile
}

export function ShopClient({ packs, ownedPackIds }: ShopClientProps) {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState<string | null>(null)

  async function handleBuy(pack: StickerPack) {
    setLoadingPackId(pack.id)
    setError('')

    try {
      const response = await fetch('/api/paymongo/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: pack.id,
          packName: pack.name,
          amount: pack.price
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Payment failed. Please try again.')
        setLoadingPackId(null)
        return
      }

      // Store payment info for verification later
      localStorage.setItem(`payment_${pack.id}`, data.paymentId)

      // Open PayMongo checkout in new tab
      window.open(data.checkoutUrl, '_blank')

      // Start verifying after 5 seconds
      setTimeout(() => {
        setLoadingPackId(null)
        setVerifying(pack.id)
      }, 5000)

    } catch {
      setError('Something went wrong. Please try again.')
      setLoadingPackId(null)
    }
  }

  async function handleVerify(packId: string) {
    const paymentId = localStorage.getItem(`payment_${packId}`)
    if (!paymentId) {
      setError('Payment ID not found. Please contact support.')
      setVerifying(null)
      return
    }

    try {
      const response = await fetch('/api/paymongo/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, packId })
      })

      const data = await response.json()

      if (data.status === 'paid') {
        localStorage.removeItem(`payment_${packId}`)
        setVerifying(null)
        window.location.reload()
      } else {
        setError('Payment not yet confirmed. Please wait a moment and try again.')
        setVerifying(null)
      }
    } catch {
      setError('Verification failed. Please try again.')
      setVerifying(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sticker Shop</h1>
        <p className="text-slate-500 text-sm mt-1">Buy sticker packs to use in chats!</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {packs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No sticker packs yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map(pack => {
            const isOwned = ownedPackIds.includes(pack.id)
            const isLoading = loadingPackId === pack.id
            const isVerifying = verifying === pack.id

            return (
              <div key={pack.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">

                {/* Pack icon */}
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                  {pack.name === 'Happy Vibes' ? '😊' : '😺'}
                </div>

                <h3 className="font-bold text-slate-900 text-lg">{pack.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{pack.description}</p>

                {/* Sticker previews */}
                <div className="flex gap-2 mt-4 mb-4">
                  {pack.name === 'Happy Vibes' ? (
                    ['😊', '😂', '🥰', '😎', '🎉'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))
                  ) : (
                    ['😺', '😸', '😹', '😻', '🙀'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-slate-900">
                      ₱{(pack.price / 100).toFixed(0)}
                    </span>
                  </div>

                  {isOwned ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-semibold">
                      <Check className="w-4 h-4" />
                      Owned
                    </div>
                  ) : isVerifying ? (
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xs text-slate-500">Paid already?</p>
                      <button
                        onClick={() => handleVerify(pack.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Verify Payment
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(pack)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      {isLoading ? 'Opening...' : 'Buy Now'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <p className="text-slate-500 text-xs text-center">
          🔒 Payments are secure and processed by PayMongo.
          After payment, click &quot;Verify Payment&quot; to unlock your stickers.
        </p>
      </div>
    </div>
  )
}
