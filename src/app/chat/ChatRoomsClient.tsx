'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Plus, Hash } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { ChatRoom, Profile } from '@/lib/types'

interface ChatRoomsClientProps {
  initialRooms: ChatRoom[]
  currentUser: Profile
}

export function ChatRoomsClient({ initialRooms, currentUser }: ChatRoomsClientProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms)
  const [showCreate, setShowCreate] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleCreateRoom() {
    if (!newRoomName.trim() || creating) return
    setCreating(true)
    setError('')

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: newRoomName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: newRoomDesc.trim() || null,
        created_by: currentUser.id
      })
      .select()
      .single()

    if (error) {
      setError(error.message.includes('unique') ? 'A room with that name already exists.' : error.message)
      setCreating(false)
    } else {
      setRooms(prev => [...prev, data])
      setNewRoomName('')
      setNewRoomDesc('')
      setShowCreate(false)
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chat Rooms</h1>
          <p className="text-slate-500 text-sm mt-1">Join a room and start chatting in real-time</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          New Room
        </button>
      </div>

      {/* Create room form */}
      {showCreate && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-4">Create a New Room</h2>
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Room Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                placeholder="e.g. gaming, music, tech"
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">Spaces will be converted to dashes</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description (optional)</label>
              <input
                type="text"
                value={newRoomDesc}
                onChange={e => setNewRoomDesc(e.target.value)}
                placeholder="What is this room about?"
                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim() || creating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setError('') }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No rooms yet</p>
          <p className="text-slate-400 text-sm mt-1">Create the first chat room!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
              onClick={() => router.push(`/chat/${room.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Hash className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      #{room.name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {room.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all">
                  Join
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
