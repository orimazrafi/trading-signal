/** Returns one or two uppercase initials from an email address. */
export function getInitialsFromEmail(email: string): string {
  const localPart = email.trim().split('@')[0] ?? ''
  const segments = localPart.split(/[._-]+/).filter((segment) => segment.length > 0)

  if (segments.length >= 2) {
    return `${segments[0]?.[0] ?? ''}${segments[1]?.[0] ?? ''}`.toUpperCase()
  }

  return localPart.slice(0, 2).toUpperCase()
}
