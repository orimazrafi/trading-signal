import { useState } from 'react'
import { Button } from '../../../components/Button'
import { LoginForm } from '../../../components/LoginForm'
import { SignupForm } from '../../../components/SignupForm'
import styles from './AuthPage.module.css'
import type { AuthMode, AuthPageProps } from './types'

/** Returns the tab button variant for the active auth mode. */
function getTabVariant(isActive: boolean): 'tab' | 'tabActive' {
  return isActive ? 'tabActive' : 'tab'
}

/** Login and signup page with optional Google SSO. */
export function AuthPage({
  error,
  onClearError,
  onLogin,
  onSignup,
  onGoogleSignIn,
}: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login')

  const switchMode = (nextMode: AuthMode) => {
    onClearError()
    setMode(nextMode)
  }

  return (
    <section className={styles.card}>
      <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      <p className={styles.subtitle}>Use email and password, or continue with Google.</p>

      <div className={styles.tabs}>
        <Button variant={getTabVariant(mode === 'login')} onClick={() => switchMode('login')}>
          Sign in
        </Button>
        <Button variant={getTabVariant(mode === 'signup')} onClick={() => switchMode('signup')}>
          Sign up
        </Button>
      </div>

      {mode === 'login' ? <LoginForm onSubmit={onLogin} /> : <SignupForm onSubmit={onSignup} />}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.divider}>or</div>

      <Button fullWidth onClick={onGoogleSignIn}>
        Continue with Google
      </Button>
    </section>
  )
}
