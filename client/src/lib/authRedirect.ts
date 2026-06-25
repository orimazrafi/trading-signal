import type { Location } from 'react-router-dom'
import { ROUTES } from '@/routes/paths'

const AUTH_RETURN_TO_KEY = 'authReturnTo'

/** Returns true when pathname is a safe in-app post-auth destination. */
function isSafeReturnPath(pathname: string): boolean {
  if (!pathname.startsWith('/')) {
    return false
  }

  if (pathname === ROUTES.login || pathname === ROUTES.home) {
    return false
  }

  return true
}

/** Builds a full path from a router location. */
function locationToPath(location: Pick<Location, 'pathname' | 'search' | 'hash'>): string {
  return `${location.pathname}${location.search}${location.hash}`
}

/** Resolves where to send the user after successful sign-in. */
export function resolvePostAuthPath(
  from: Pick<Location, 'pathname' | 'search' | 'hash'> | null | undefined,
): string {
  if (from && isSafeReturnPath(from.pathname)) {
    return locationToPath(from)
  }

  return ROUTES.dashboard
}

/** Persists a return path for OAuth flows that bypass the login form. */
export function storeAuthReturnTo(path: string): void {
  const pathname = path.split('?')[0] ?? path

  if (!isSafeReturnPath(pathname)) {
    return
  }

  sessionStorage.setItem(AUTH_RETURN_TO_KEY, path)
}

/** Reads and clears a stored OAuth return path. */
export function consumeStoredAuthReturnTo(): string | null {
  const stored = sessionStorage.getItem(AUTH_RETURN_TO_KEY)

  if (!stored) {
    return null
  }

  sessionStorage.removeItem(AUTH_RETURN_TO_KEY)
  return stored
}
