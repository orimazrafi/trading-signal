/** Authenticated user returned by the API. */
export type AuthUser = {
  userId: string
  email: string
}

/** Response body for auth endpoints that return the session user. */
export type AuthResponse = {
  user: AuthUser
}

/** Response body for POST /api/auth/logout. */
export type LogoutResponse = {
  ok: boolean
}

/** OAuth redirect error codes passed via ?authError= query param. */
export type OAuthRedirectErrorCode =
  | 'invalid_oauth_state'
  | 'invalid_client'
  | 'invalid_grant'
  | 'google_not_configured'
  | 'google_sign_in_failed'

/** User-facing messages for OAuth redirect failures from the server. */
export const OAUTH_REDIRECT_ERROR_MESSAGES: Record<OAuthRedirectErrorCode, string> = {
  invalid_oauth_state: 'Sign-in session expired. Please try Google sign-in again.',
  invalid_client:
    'Google sign-in is misconfigured. In Google Cloud Console, reset the OAuth client secret, paste it into server/.env, and restart the server.',
  invalid_grant: 'Google sign-in expired. Please try again.',
  google_not_configured: 'Google sign-in is not configured on the server.',
  google_sign_in_failed: 'Google sign-in failed. Please try again.',
}
