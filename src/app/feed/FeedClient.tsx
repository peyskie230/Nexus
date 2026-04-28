'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Post, Profile } from '@/lib/types'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { PostSkeleton } from '@/components/shared/SkeletonCard'
import { ImageUpload } from '@/components/shared/ImageUpload'

interface FeedClientProps {
  initialPosts: Post[]
  currentUser: Profile
}

export function FeedClient({ initialPosts, currentUser }: FeedClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [loading] = useState(false)
  const supabase = createClient()

  async function handlePost() {
    if ((!content.trim() && !imageUrl) || posting) return
    setPosting(true)

    const { data, error } = await supabase
      .from('posts')
      .insert({
        content: content.trim(),
        user_id: currentUser.id,
        image_url: imageUrl || null
      })
      .select('*, profiles(*)')
      .single()

    if (!error && data) {
      setPosts(prev => [{ ...data, user_has_liked: false }, ...prev])
      setContent('')
      setImageUrl(null)
    }
    setPosting(false)
  }

  async function handleLike(postId: string, userHasLiked: boolean) {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: userHasLiked ? p.likes_count - 1 : p.likes_count + 1, user_has_liked: !userHasLiked }
        : p
    ))
    await supabase.rpc('toggle_like', {
      p_post_id: postId,
      p_user_id: currentUser.id
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Home Feed</h1>
        <p className="text-slate-500 text-sm mt-1">See what everyone is sharing</p>
      </div>

      {/* Create post box */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-start gap-4">
          <UserAvatar displayName={currentUser.display_name} avatarColor={currentUser.avatar_color} avatarUrl={currentUser.avatar_url} />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
              }}
              className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />

            {/* Image preview */}
            {imageUrl && (
              <div className="mt-3">
                <ImageUpload
                  userId={currentUser.id}
                  folder="posts"
                  onUpload={setImageUrl}
                  onRemove={() => setImageUrl(null)}
                  previewUrl={imageUrl}
                />
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {!imageUrl && (
                  <ImageUpload
                    userId={currentUser.id}
                    folder="posts"
                    onUpload={setImageUrl}
                    compact={false}
                  />
                )}
                <p className="text-xs text-slate-400">Ctrl+Enter to post</p>
              </div>
              <button
                onClick={handlePost}
                disabled={(!content.trim() && !imageUrl) || posting}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👋</p>
          <p className="text-slate-600 font-medium">No posts yet!</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to share something.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <UserAvatar
                  displayName={post.profiles?.display_name || 'User'}
                  avatarColor={post.profiles?.avatar_color || '#4F46E5'}
                  avatarUrl={post.profiles?.avatar_url}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">
                      {post.profiles?.display_name || 'User'}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {post.content && (
                    <p className="text-slate-700 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}
                  {post.image_url && (
                    <div className="mt-3">
                      <img
                        src={post.image_url}
                        alt="Post image"
                        className="max-h-96 w-full object-cover rounded-xl border border-slate-100"
                      />
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => handleLike(post.id, post.user_has_liked || false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        post.user_has_liked
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                      {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
