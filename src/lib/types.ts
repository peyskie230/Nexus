// src/lib/types.ts
// TypeScript type definitions for all our database tables.

export interface Profile {
  id: string
  display_name: string
  avatar_color: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
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
  created_at: string
  profiles?: Profile
}