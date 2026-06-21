import { AuthPage, useAuth } from './features/auth'
import { Dashboard } from './features/dashboard'
import { useOAuthRedirectError } from './hooks/useOAuthRedirectError'
import styles from './App.module.css'

/** Root app shell with authentication gate. */
function App() {
  const { user, loading, error, setError, login, signup, logout, startGoogleSignIn } = useAuth()

  useOAuthRedirectError(setError)

  const runAuthAction = async (
    action: (email: string, password: string) => Promise<void>,
    email: string,
    password: string,
  ) => {
    try {
      await action(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  const handleLogin = (email: string, password: string) => runAuthAction(login, email, password)
  const handleSignup = (email: string, password: string) => runAuthAction(signup, email, password)
  const handleClearError = () => setError(null)
  const handleLogout = () => void logout()

  if (loading) {
    return (
      <main className={styles.app}>
        <p>Loading...</p>
      </main>
    )
  }

  if (!user) {
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

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
