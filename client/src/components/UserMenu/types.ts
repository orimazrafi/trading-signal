export type UserMenuProps = {
  email: string
  pictureUrl?: string | null
  onLogout: () => void
}

export type UserAvatarProps = {
  email: string
  pictureUrl?: string | null
  className?: string
}
