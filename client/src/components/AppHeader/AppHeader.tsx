import { Button } from '@/components/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { AppHeaderProps } from './types'

/** Top bar showing the signed-in user and sign-out action. */
function AppHeader({ email, onLogout }: AppHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="text-left">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Trading Signal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="secondary" onClick={onLogout}>
          Sign out
        </Button>
      </div>
    </header>
  )
}

export default AppHeader
