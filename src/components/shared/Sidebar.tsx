'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, MessageSquare, User, Settings, LogOut, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { UserAvatar } from './UserAvatar'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils'

interface SidebarProps {
  profile: Profile
}

const navItems = [
  { href: '/feed',    icon: Home,          label: 'Home'     },
  { href: '/chat',    icon: MessageSquare, label: 'Chat'     },
  { href: '/profile', icon: User,          label: 'Profile'  },
  { href: '/settings',icon: Settings,      label: 'Settings' },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 hidden md:flex flex-col z-40 border-r border-slate-800">

      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-4 pb-2">
        <ThemeToggle
          showLabel
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        />
      </div>

      {/* User info + logout at the bottom */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors mb-1">
          <UserAvatar
            displayName={profile.display_name}
            avatarColor={profile.avatar_color}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile.display_name}</p>
            <p className="text-slate-500 text-xs truncate">Online</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-1"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}
