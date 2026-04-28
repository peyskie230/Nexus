'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface PresenceProviderProps {
  userId: string
  children: React.ReactNode
}

export function PresenceProvider({ userId, children }: PresenceProviderProps) {
  const supabase = createClient()
  const visibilityHandler = useRef<() => void>()

  useEffect(() => {
    async function setOnline() {
      try {
        await supabase
          .from('user_presence')
          .upsert({ id: userId, is_online: true, last_seen: new Date().toISOString() })
      } catch { /* table may not exist yet */ }
    }

    async function setOffline() {
      try {
        await supabase
          .from('user_presence')
          .upsert({ id: userId, is_online: false, last_seen: new Date().toISOString() })
      } catch { /* table may not exist yet */ }
    }

    setOnline()

    function handleVisibility() {
      if (document.visibilityState === 'hidden') setOffline()
      else setOnline()
    }

    visibilityHandler.current = handleVisibility

    window.addEventListener('beforeunload', setOffline)
    document.addEventListener('visibilitychange', handleVisibility)

    const heartbeat = setInterval(setOnline, 30000)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('beforeunload', setOffline)
      if (visibilityHandler.current) {
        document.removeEventListener('visibilitychange', visibilityHandler.current)
      }
      setOffline()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return <>{children}</>
}
