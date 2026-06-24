import { useEffect } from 'react'
import {
  OAUTH_REDIRECT_ERROR_MESSAGES,
  type OAuthRedirectErrorCode,
} from '@/types/auth'

/** Reads ?authError= from the URL after a failed Google OAuth redirect. */
export function useOAuthRedirectError(setError: (message: string | null) => void): void {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authError = params.get('authError')

    if (!authError) {
      return
    }

    const message =
      OAUTH_REDIRECT_ERROR_MESSAGES[authError as OAuthRedirectErrorCode] ??
      OAUTH_REDIRECT_ERROR_MESSAGES.google_sign_in_failed

    setError(message)
    window.history.replaceState({}, '', window.location.pathname)
  }, [setError])
}
