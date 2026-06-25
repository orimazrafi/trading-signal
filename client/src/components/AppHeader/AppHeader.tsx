import { InstallAppButton } from '@/components/InstallAppButton'
import { MarketStatusIndicator } from '@/components/MarketStatusIndicator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import type { AppHeaderProps } from './types'

/** Top bar with app title and account actions. */
function AppHeader({ email, pictureUrl, onLogout }: AppHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="text-left">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Trading Signal
        </h1>
        <MarketStatusIndicator className="mt-2" />
      </div>
      <div className="flex items-center gap-2">
        <InstallAppButton />
        <ThemeToggle />
        <UserMenu email={email} pictureUrl={pictureUrl} onLogout={onLogout} />
      </div>
    </header>
  )
}

export default AppHeader
