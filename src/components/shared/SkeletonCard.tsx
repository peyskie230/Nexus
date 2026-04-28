// src/components/shared/SkeletonCard.tsx
// Animated placeholder shown while posts or messages are loading.
// Looks like a blurred version of the real content.

import { Skeleton } from '@/components/ui/skeleton'

export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          {/* Name and time placeholders */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          {/* Content placeholders */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  )
}