'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface PresenceProviderProps {
  userId: string
  children: React.ReactNode
}

export function PresenceProvider({ userId, children }: PresenceProviderProps) {
  const supabase = createClient()

  useEffect(() => {
    async function setOnline() {
      await supabase
        .from('user_presence')
        .upsert({ id: userId, is_online: true, last_seen: new Date().toISOString() })
    }

    async function setOffline() {
      await supabase
        .from('user_presence')
        .upsert({ id: userId, is_online: false, last_seen: new Date().toISOString() })
    }

    setOnline()

    // Set offline when tab is closed or user leaves
    window.addEventListener('beforeunload', setOffline)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') setOffline()
      else setOnline()
    })

    // Heartbeat every 30 seconds to keep online status fresh
    const heartbeat = setInterval(setOnline, 30000)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('beforeunload', setOffline)
      setOffline()
    }
  }, [userId])

  return <>{children}</>
}
