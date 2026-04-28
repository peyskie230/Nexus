// src/components/shared/UserAvatar.tsx
// Displays a colored circle with the user's initials.
// Used everywhere a profile picture would normally appear.

interface UserAvatarProps {
  displayName: string
  avatarColor: string
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ displayName, avatarColor, size = 'md' }: UserAvatarProps) {
  // Get initials: "John Doe" → "JD", "Alice" → "A"
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: avatarColor }}
    >
      {initials}
    </div>
  )
}