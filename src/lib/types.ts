// src/lib/types.ts
// TypeScript type definitions for all our database tables.

export interface Profile {
  id: string
  display_name: string
  avatar_color: string
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string | null
  likes_count: number
  created_at: string
  profiles?: Profile
  user_has_liked?: boolean
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface ChatRoom {
  id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
}

export interface Message {
  id: string
  room_id: string
  user_id: string
  content: string
  image_url?: string | null
  created_at: string
  profiles?: Profile
}

export interface UserPresence {
  id: string
  is_online: boolean
  last_seen: string
}

export interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  updated_at: string
  other_user?: Profile
  last_message?: DirectMessage
}

export interface DirectMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  profiles?: Profile
}