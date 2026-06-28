import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { AuthHero } from '@/features/auth/components/AuthHero'
import { useOAuthRedirectError } from '@/hooks/useOAuthRedirectError'
import { resolvePostAuthPath, storeAuthReturnTo } from '@/lib/authRedirect'
import { readLoginRedirectFrom } from '@/lib/locationState'

/** Public sign-in page with split layout; redirects authenticated users. */
function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, error, setError, login, signup, startGoogleSignIn } = useAuthContext()
  const redirectFrom = readLoginRedirectFrom(location.state)

  useOAuthRedirectError(setError)

  const runAuthAction = async (
    action: (email: string, password: string) => Promise<void>,
    email: string,
    password: string,
  ) => {
    try {
      await action(email, password)
      navigate(resolvePostAuthPath(redirectFrom), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  const handleLogin = (email: string, password: string) => runAuthAction(login, email, password)
  const handleSignup = (email: string, password: string) => runAuthAction(signup, email, password)
  const handleClearError = () => setError(null)

  /** Stores the intended path before redirecting to Google OAuth. */
  const handleGoogleSignIn = () => {
    storeAuthReturnTo(resolvePostAuthPath(redirectFrom))
    startGoogleSignIn()
  }

  if (user) {
    return <Navigate to={resolvePostAuthPath(redirectFrom)} replace />
  }

  return (
    <main className="flex min-h-svh bg-background">
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[42%] lg:max-w-xl lg:px-14">
        <AuthPage
          error={error}
          onClearError={handleClearError}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
      <AuthHero />
    </main>
  )
}

export default LoginPage
