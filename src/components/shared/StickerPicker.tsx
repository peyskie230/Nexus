'use client'

import { useState, useEffect, useRef } from 'react'
import { Smile, X } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Sticker {
  emoji: string
  name: string
}

interface StickerPack {
  id: string
  name: string
  price: number
  stickers: Sticker[]
}

const STICKER_DATA: Record<string, Sticker[]> = {
  'Happy Vibes': [
    { emoji: '😊', name: 'smile' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '🥰', name: 'love' },
    { emoji: '😎', name: 'cool' },
    { emoji: '🎉', name: 'party' },
    { emoji: '🔥', name: 'fire' },
    { emoji: '💯', name: 'hundred' },
    { emoji: '🥳', name: 'celebrate' },
    { emoji: '😍', name: 'heart eyes' },
    { emoji: '🤩', name: 'star struck' },
    { emoji: '😄', name: 'happy' },
    { emoji: '🙌', name: 'hands up' },
  ],
  'Cool Cats': [
    { emoji: '😺', name: 'cat smile' },
    { emoji: '😸', name: 'cat laugh' },
    { emoji: '😹', name: 'cat tears' },
    { emoji: '😻', name: 'cat love' },
    { emoji: '🙀', name: 'cat shock' },
    { emoji: '😿', name: 'cat sad' },
    { emoji: '😾', name: 'cat grumpy' },
    { emoji: '🐱', name: 'cat' },
    { emoji: '🐈', name: 'cat walk' },
    { emoji: '🐈‍⬛', name: 'black cat' },
    { emoji: '😼', name: 'cat smirk' },
    { emoji: '😽', name: 'cat kiss' },
  ],
  'Starter Pack': [
    { emoji: '👋', name: 'wave' },
    { emoji: '👍', name: 'thumbs up' },
    { emoji: '❤️', name: 'heart' },
    { emoji: '😀', name: 'grin' },
    { emoji: '🤔', name: 'thinking' },
    { emoji: '👏', name: 'clap' },
    { emoji: '🎊', name: 'confetti' },
    { emoji: '✨', name: 'sparkles' },
    { emoji: '💪', name: 'strong' },
    { emoji: '🙏', name: 'please' },
    { emoji: '😮', name: 'wow' },
    { emoji: '🤣', name: 'rofl' },
  ]
}

interface StickerPickerProps {
  userId: string
  onSelect: (emoji: string) => void
}

export function StickerPicker({ userId, onSelect }: StickerPickerProps) {
  const [open, setOpen] = useState(false)
  const [packs, setPacks] = useState<StickerPack[]>([])
  const [activePack, setActivePack] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!open) return

    async function fetchOwnedPacks() {
      setLoading(true)
      try {
        const { data: ownedPacks } = await supabase
          .from('user_sticker_packs')
          .select('pack_id, sticker_packs(id, name, price)')
          .eq('user_id', userId)

        if (ownedPacks && ownedPacks.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedPacks: StickerPack[] = (ownedPacks as any[])
            .map((op) => ({
              id: op.sticker_packs.id,
              name: op.sticker_packs.name,
              price: op.sticker_packs.price,
              stickers: STICKER_DATA[op.sticker_packs.name] || []
            }))
            .filter((p: StickerPack) => p.stickers.length > 0)

          setPacks(formattedPacks)
          if (formattedPacks.length > 0) {
            setActivePack(formattedPacks[0].id)
          }
        }
      } catch (e) {
        console.error('Error fetching sticker packs:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchOwnedPacks()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(emoji: string) {
    onSelect(emoji)
    setOpen(false)
  }

  const currentPack = packs.find(p => p.id === activePack)

  return (
    <div className="relative flex-shrink-0" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100"
        title="Stickers"
      >
        <Smile className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-900 text-sm">Stickers</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {packs.length > 1 && (
            <div className="flex gap-1 px-3 pt-2 overflow-x-auto">
              {packs.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => setActivePack(pack.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activePack === pack.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pack.name}
                </button>
              ))}
            </div>
          )}

          <div className="p-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">Loading stickers...</p>
              </div>
            ) : packs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🛍️</p>
                <p className="text-slate-600 text-sm font-medium">No sticker packs yet</p>
                <Link
                  href="/shop"
                  className="text-indigo-500 text-xs hover:underline mt-1 block"
                >
                  Visit the Shop →
                </Link>
              </div>
            ) : currentPack ? (
              <div className="grid grid-cols-6 gap-1">
                {currentPack.stickers.map((sticker, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(sticker.emoji)}
                    className="text-2xl p-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center"
                    title={sticker.name}
                  >
                    {sticker.emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {packs.length > 0 && (
            <div className="px-4 pb-3 pt-1 border-t border-slate-100">
              <Link
                href="/shop"
                className="text-indigo-500 text-xs hover:underline"
              >
                🛍️ Get more sticker packs →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
