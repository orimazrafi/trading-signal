import { useEffect } from 'react'
import {
  isOAuthRedirectErrorCode,
  OAUTH_REDIRECT_ERROR_MESSAGES,
} from '@/types/auth'

/** Reads ?authError= from the URL after a failed Google OAuth redirect. */
export function useOAuthRedirectError(setError: (message: string | null) => void): void {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authError = params.get('authError')

    if (!authError) {
      return
    }

    const message = isOAuthRedirectErrorCode(authError)
      ? OAUTH_REDIRECT_ERROR_MESSAGES[authError]
      : OAUTH_REDIRECT_ERROR_MESSAGES.google_sign_in_failed

    setError(message)
    window.history.replaceState({}, '', window.location.pathname)
  }, [setError])
}
