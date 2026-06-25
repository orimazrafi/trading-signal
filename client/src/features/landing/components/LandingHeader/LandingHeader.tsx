import { Button } from '@/components/Button'
import { MarketStatusIndicator } from '@/components/MarketStatusIndicator'
import { ThemeToggle } from '@/components/ThemeToggle'
import type { LandingHeaderProps } from './types'

/** Public landing header with sign-in call to action. */
function LandingHeader({ onSignIn }: LandingHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trading Signal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live market headlines — no sign-in required</p>
        <MarketStatusIndicator className="mt-2" />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="primary" onClick={onSignIn}>
          Sign in
        </Button>
      </div>
    </header>
  )
}

export default LandingHeader
