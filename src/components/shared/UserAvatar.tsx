interface UserAvatarProps {
  displayName: string
  avatarColor: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ displayName, avatarColor, avatarUrl, size = 'md' }: UserAvatarProps) {
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

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
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
