// src/components/shared/AppLayout.tsx
// The main layout for all pages after login.
// Sidebar on the left, content on the right.

import { Sidebar } from './Sidebar'
import { Profile } from '@/lib/types'

interface AppLayoutProps {
  profile: Profile
  children: React.ReactNode
}

export function AppLayout({ profile, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar — fixed on the left */}
      <Sidebar profile={profile} />

      {/* Main content — pushed right by the sidebar width */}
      <main className="ml-64 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}