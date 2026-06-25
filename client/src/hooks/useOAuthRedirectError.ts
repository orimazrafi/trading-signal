import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  isOAuthRedirectErrorCode,
  OAUTH_REDIRECT_ERROR_MESSAGES,
} from '@/types/auth'

/** Reads ?authError= from the URL after a failed Google OAuth redirect. */
export function useOAuthRedirectError(setError: (message: string | null) => void): void {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const authError = searchParams.get('authError')

    if (!authError) {
      return
    }

    const message = isOAuthRedirectErrorCode(authError)
      ? OAUTH_REDIRECT_ERROR_MESSAGES[authError]
      : OAUTH_REDIRECT_ERROR_MESSAGES.google_sign_in_failed

    setError(message)
    setSearchParams({}, { replace: true })
  }, [searchParams, setError, setSearchParams])
}
