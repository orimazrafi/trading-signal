import { Button } from '@/components/Button'
import type { LandingHeaderProps } from './types'

/** Public landing header with sign-in call to action. */
function LandingHeader({ onSignIn }: LandingHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trading Signal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live market headlines — no sign-in required</p>
      </div>
      <Button variant="primary" onClick={onSignIn}>
        Sign in
      </Button>
    </header>
  )
}

export default LandingHeader
