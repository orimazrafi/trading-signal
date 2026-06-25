import { Navigate, useNavigate } from 'react-router-dom'
import { AuthPage } from '@/features/auth'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useOAuthRedirectError } from '@/hooks/useOAuthRedirectError'
import { ROUTES } from '@/routes/paths'
import styles from '@/App.module.css'

/** Public sign-in page; redirects authenticated users to the dashboard. */
function LoginPage() {
  const navigate = useNavigate()
  const { user, error, setError, login, signup, startGoogleSignIn } = useAuthContext()

  useOAuthRedirectError(setError)

  const runAuthAction = async (
    action: (email: string, password: string) => Promise<void>,
    email: string,
    password: string,
  ) => {
    try {
      await action(email, password)
      navigate(ROUTES.dashboard, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  const handleLogin = (email: string, password: string) => runAuthAction(login, email, password)
  const handleSignup = (email: string, password: string) => runAuthAction(signup, email, password)
  const handleClearError = () => setError(null)

  if (user) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return (
    <main className={styles.app}>
      <h1>Trading Signal</h1>
      <AuthPage
        error={error}
        onClearError={handleClearError}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onGoogleSignIn={startGoogleSignIn}
      />
    </main>
  )
}

export default LoginPage
