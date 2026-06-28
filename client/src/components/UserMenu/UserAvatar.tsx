import { getInitialsFromEmail } from '@/lib/userInitials'
import { cn } from '@/lib/utils'
import type { UserAvatarProps } from './types'

/** Renders the user's Google profile photo or email initials. */
function UserAvatar({ email, pictureUrl, className }: UserAvatarProps) {
  const initials = getInitialsFromEmail(email)

  if (pictureUrl) {
    return (
      <img
        src={pictureUrl}
        alt=""
        className={cn('size-9 rounded-full object-cover ring-1 ring-border', className)}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-border',
        className,
      )}
    >
      {initials}
    </span>
  )
}

export default UserAvatar
