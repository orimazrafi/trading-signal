import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useOAuthRedirectError } from '@/hooks/useOAuthRedirectError'
import { resolvePostAuthPath, storeAuthReturnTo } from '@/lib/authRedirect'
import { readLoginRedirectFrom } from '@/lib/locationState'
import styles from '@/App.module.css'

/** Public sign-in page; redirects authenticated users to their intended destination. */
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
    <main className={styles.app}>
      <h1>Trading Signal</h1>
      <AuthPage
        error={error}
        onClearError={handleClearError}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </main>
  )
}

export default LoginPage
