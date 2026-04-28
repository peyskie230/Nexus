import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { Profile } from '@/lib/types'

interface AppLayoutProps {
  profile: Profile
  children: React.ReactNode
}

export function AppLayout({ profile, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar — only visible on desktop */}
      <div className="hidden md:block">
        <Sidebar profile={profile} />
      </div>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — only visible on mobile */}
      <div className="md:hidden">
        <MobileNav profile={profile} />
      </div>
    </div>
  )
}
