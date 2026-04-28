'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, MessageSquare, User, Settings, LogOut, Zap, Menu, X, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Profile, UserPresence } from '@/lib/types'
import { UserAvatar } from './UserAvatar'
import { PresenceProvider } from './PresenceProvider'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  profile: Profile
  children: React.ReactNode
}

const navItems = [
  { href: '/feed',     icon: Home,          label: 'Home'     },
  { href: '/chat',     icon: MessageSquare, label: 'Chat'     },
  { href: '/profile',  icon: User,          label: 'Profile'  },
  { href: '/settings', icon: Settings,      label: 'Settings' },
]

function OnlineUsers({ currentUserId }: { currentUserId: string }) {
  const [onlineUsers, setOnlineUsers] = useState<(Profile & { presence?: UserPresence })[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchOnlineUsers() {
      const { data } = await supabase
        .from('user_presence')
        .select('*, profiles(*)')
        .eq('is_online', true)
        .neq('id', currentUserId)

      if (data) {
        const users = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => ({ ...p.profiles, presence: { id: p.id, is_online: p.is_online, last_seen: p.last_seen } }))
          .filter(Boolean)
        setOnlineUsers(users)
      }
    }

    fetchOnlineUsers()

    const channel = supabase
      .channel('online-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, fetchOnlineUsers)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  if (onlineUsers.length === 0) return (
    <div className="px-4 py-3">
      <p className="text-slate-600 text-xs">No one else online</p>
    </div>
  )

  return (
    <div className="space-y-1 px-2">
      {onlineUsers.map(user => (
        <Link
          key={user.id}
          href={`/dm/${user.id}`}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-all group"
        >
          <div className="relative flex-shrink-0">
            <UserAvatar displayName={user.display_name} avatarColor={user.avatar_color} size="sm" />
            <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-400 fill-green-400" />
          </div>
          <span className="text-slate-400 text-sm truncate group-hover:text-white transition-colors">
            {user.display_name}
          </span>
        </Link>
      ))}
    </div>
  )
}

export function AppLayout({ profile, children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <PresenceProvider userId={profile.id}>
      <div className="min-h-screen bg-slate-50">

        {/* ===== DESKTOP SIDEBAR ===== */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 flex-col z-40 border-r border-slate-800 hidden md:flex">
          <div className="p-6 border-b border-slate-800">
            <Link href="/feed" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">Nexus</p>
                <p className="text-slate-500 text-xs leading-none mt-0.5">Connect. Share. Belong.</p>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Online Users Section */}
          <div className="flex-1 overflow-y-auto border-t border-slate-800 mt-2">
            <div className="px-4 py-3">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Online Now</p>
            </div>
            <OnlineUsers currentUserId={profile.id} />
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors mb-1">
              <div className="relative flex-shrink-0">
                <UserAvatar displayName={profile.display_name} avatarColor={profile.avatar_color} size="sm" />
                <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-400 fill-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{profile.display_name}</p>
                <p className="text-green-400 text-xs truncate">Online</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-1">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </aside>

        {/* ===== MOBILE TOP BAR ===== */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">Nexus</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar displayName={profile.display_name} avatarColor={profile.avatar_color} size="sm" />
              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-400 fill-green-400" />
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ===== MOBILE DROPDOWN MENU ===== */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-14 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}>
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              )
            })}

            {/* Online users in mobile menu */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-2">Online Now</p>
              <OnlineUsers currentUserId={profile.id} />
            </div>

            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border-t border-slate-800 mt-2">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </PresenceProvider>
  )
}
