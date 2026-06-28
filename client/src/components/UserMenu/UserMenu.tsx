import { LogOutIcon } from 'lucide-react'
import { useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserMenuProps } from './types'
import UserAvatar from './UserAvatar'

/** Account menu with profile photo, email, and sign-out action. */
function UserMenu({ email, pictureUrl, onLogout }: UserMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)

  /** Clears focus after close so the avatar does not keep a visible focus ring. */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      return
    }

    requestAnimationFrame(() => {
      triggerRef.current?.blur()
    })
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className="cursor-pointer rounded-full outline-hidden transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Account menu"
        >
          <UserAvatar email={email} pictureUrl={pictureUrl} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="truncate font-normal text-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserMenu
