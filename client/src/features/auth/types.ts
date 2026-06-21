export type AuthPageProps = {
  error: string | null
  onClearError: () => void
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (email: string, password: string) => Promise<void>
  onGoogleSignIn: () => void
}

export type AuthMode = 'login' | 'signup'
