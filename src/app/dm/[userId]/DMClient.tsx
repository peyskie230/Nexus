'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft, Send, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Conversation, DirectMessage, Profile } from '@/lib/types'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface DMClientProps {
  conversation: Conversation | null
  otherUser: Profile
  initialMessages: DirectMessage[]
  currentUser: Profile
}

export function DMClient({ conversation, otherUser, initialMessages, currentUser }: DMClientProps) {
  const [messages, setMessages] = useState<DirectMessage[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [isOtherOnline, setIsOtherOnline] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check if other user is online
  useEffect(() => {
    async function checkPresence() {
      const { data } = await supabase
        .from('user_presence')
        .select('is_online')
        .eq('id', otherUser.id)
        .single()
      if (data) setIsOtherOnline(data.is_online)
    }

    checkPresence()

    const channel = supabase
      .channel(`presence:${otherUser.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `id=eq.${otherUser.id}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        setIsOtherOnline(payload.new.is_online)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUser.id])

  // Real-time messages
  useEffect(() => {
    if (!conversation?.id) return

    const channel = supabase
      .channel(`dm:${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, async (payload) => {
        const { data } = await supabase
          .from('direct_messages')
          .select('*, profiles(*)')
          .eq('id', payload.new.id)
          .single()

        if (data) {
          setMessages(prev => {
            if (prev.find(m => m.id === data.id)) return prev
            return [...prev, data]
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id])

  async function handleSend() {
    if (!content.trim() || sending || !conversation?.id) return
    setSending(true)

    const { error } = await supabase
      .from('direct_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: content.trim()
      })

    if (!error) setContent('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] -mx-4 md:mx-0 -my-6 md:-my-8">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-shrink-0">
          <UserAvatar displayName={otherUser.display_name} avatarColor={otherUser.avatar_color} avatarUrl={otherUser.avatar_url} size="sm" />
          {isOtherOnline && (
            <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-400 fill-green-400" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-slate-900 text-sm truncate">{otherUser.display_name}</h1>
          <p className={`text-xs ${isOtherOnline ? 'text-green-500' : 'text-slate-400'}`}>
            {isOtherOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <UserAvatar displayName={otherUser.display_name} avatarColor={otherUser.avatar_color} avatarUrl={otherUser.avatar_url} size="lg" />
            <p className="text-slate-600 font-medium mt-4">Start a conversation with {otherUser.display_name}</p>
            <p className="text-slate-400 text-sm mt-1">Messages are private between you two.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = message.sender_id === currentUser.id
            const prevMessage = messages[index - 1]
            const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id

            return (
              <div key={message.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''} ${!showAvatar ? (isMe ? 'mr-11' : 'ml-11') : ''}`}>
                {showAvatar && (
                  <UserAvatar
                    displayName={isMe ? currentUser.display_name : otherUser.display_name}
                    avatarColor={isMe ? currentUser.avatar_color : otherUser.avatar_color}
                    avatarUrl={isMe ? currentUser.avatar_url : otherUser.avatar_url}
                    size="sm"
                  />
                )}
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && (
                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-slate-900 text-xs">
                        {isMe ? 'You' : otherUser.display_name}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <UserAvatar displayName={currentUser.display_name} avatarColor={currentUser.avatar_color} avatarUrl={currentUser.avatar_url} size="sm" />
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Message ${otherUser.display_name}...`}
              className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm min-w-0"
            />
            <button
              onClick={handleSend}
              disabled={!content.trim() || sending || !conversation?.id}
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
