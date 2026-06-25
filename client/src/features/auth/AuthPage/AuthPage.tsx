import { useState } from 'react'
import { Button } from '@/components/Button'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoginForm } from '@/components/LoginForm'
import { SignupForm } from '@/components/SignupForm'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { AuthMode, AuthPageProps } from './types'

/** Returns the tab button variant for the active auth mode. */
function getTabVariant(isActive: boolean): 'tab' | 'tabActive' {
  return isActive ? 'tabActive' : 'tab'
}

/** Login and signup form for the split authentication layout. */
function AuthPage({
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
    <section className="w-full max-w-md text-left">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Trading Signal</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use email and password, or continue with Google.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mb-5 flex gap-2 rounded-xl border border-border bg-muted/50 p-1">
        <Button variant={getTabVariant(mode === 'login')} fullWidth onClick={() => switchMode('login')}>
          Sign in
        </Button>
        <Button variant={getTabVariant(mode === 'signup')} fullWidth onClick={() => switchMode('signup')}>
          Sign up
        </Button>
      </div>

      {mode === 'login' ? <LoginForm onSubmit={onLogin} /> : <SignupForm onSubmit={onSignup} />}

      {error ? (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      ) : null}

      <div className="my-5 text-center text-sm text-muted-foreground">or</div>

      <Button fullWidth onClick={onGoogleSignIn}>
        Continue with Google
      </Button>
    </section>
  )
}

export default AuthPage
