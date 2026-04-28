'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Send, Hash } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { ChatRoom, Message, Profile } from '@/lib/types'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { MessageSkeleton } from '@/components/shared/SkeletonCard'

interface ChatRoomClientProps {
  room: ChatRoom
  initialMessages: Message[]
  currentUser: Profile
}

export function ChatRoomClient({ room, initialMessages, currentUser }: ChatRoomClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${room.id}`
        },
        async (payload) => {
          // Fetch the full message with profile info
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(m => m.id === data.id)) return prev
              return [...prev, data]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room.id])

  async function handleSend() {
    if (!content.trim() || sending) return
    setSending(true)

    const { error } = await supabase
      .from('messages')
      .insert({
        room_id: room.id,
        user_id: currentUser.id,
        content: content.trim()
      })

    if (!error) setContent('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -my-8">

      {/* Room header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-100 rounded-t-2xl shadow-sm flex-shrink-0">
        <button
          onClick={() => router.push('/chat')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Hash className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900">#{room.name}</h1>
          <p className="text-slate-500 text-xs">{room.description || 'No description'}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-white px-6 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <MessageSkeleton key={i} />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <Hash className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No messages yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const prevMessage = messages[index - 1]
            const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id

            return (
              <div key={message.id} className={`flex items-start gap-3 ${!showAvatar ? 'ml-11' : ''}`}>
                {showAvatar && (
                  <UserAvatar
                    displayName={message.profiles?.display_name || 'User'}
                    avatarColor={message.profiles?.avatar_color || '#4F46E5'}
                    size="sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-slate-900 text-sm">
                        {message.profiles?.display_name || 'User'}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  <p className="text-slate-700 text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 rounded-b-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <UserAvatar
            displayName={currentUser.display_name}
            avatarColor={currentUser.avatar_color}
            size="sm"
          />
          <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Message #${room.name}`}
              className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!content.trim() || sending}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
