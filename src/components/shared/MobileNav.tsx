'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, MessageSquare, User, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/feed',     icon: Home,          label: 'Home'    },
  { href: '/chat',     icon: MessageSquare, label: 'Chat'    },
  { href: '/profile',  icon: User,          label: 'Profile' },
  { href: '/settings', icon: Settings,      label: 'Settings'},
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0',
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-indigo-400')} />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
