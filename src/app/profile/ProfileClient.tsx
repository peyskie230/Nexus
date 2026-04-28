'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Pencil, Check, X, Heart, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Profile, Post } from '@/lib/types'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface ProfileClientProps {
  initialProfile: Profile
  initialPosts: Post[]
  userEmail: string
}

export function ProfileClient({ initialProfile, initialPosts, userEmail }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [posts] = useState<Post[]>(initialPosts)
  const [editing, setEditing] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(profile.display_name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    if (!newDisplayName.trim() || saving) return
    setSaving(true)
    setError('')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: newDisplayName.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single()

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setProfile(data)
      setEditing(false)
      setSaving(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  function handleCancel() {
    setNewDisplayName(profile.display_name)
    setEditing(false)
    setError('')
  }

  const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and see your posts</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-start gap-6">
          <UserAvatar
            displayName={profile.display_name}
            avatarColor={profile.avatar_color}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            {/* Display name */}
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={e => setNewDisplayName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSave()
                      if (e.key === 'Escape') handleCancel()
                    }}
                    autoFocus
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!newDisplayName.trim() || saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{profile.display_name}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-500 text-sm mt-1">{userEmail}</p>
                {success && (
                  <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Display name updated!
                  </p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mt-5 pt-5 border-t border-slate-100">
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="text-xl font-bold">{posts.length}</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">Posts</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-xl font-bold">{totalLikes}</span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">Total Likes</p>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-center">
                <p className="text-slate-900 text-sm font-semibold">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Joined</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's posts */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Posts</h2>
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No posts yet</p>
            <p className="text-slate-400 text-sm mt-1">Share something on the home feed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    displayName={profile.display_name}
                    avatarColor={profile.avatar_color}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        {profile.display_name}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-xs">
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
