import { Download } from 'lucide-react'
import { Button } from '@/components/Button'
import { usePwaInstallPrompt } from '@/hooks/usePwaInstallPrompt'
import { cn } from '@/lib/utils'
import { PWA_ACCENT_COLOR } from '@/lib/pwa/constants'
import type { InstallAppButtonProps } from './types'

/** Premium install CTA that defers to the browser's native PWA install prompt. */
function InstallAppButton({ className }: InstallAppButtonProps) {
  const { canInstall, isInstalling, promptInstall } = usePwaInstallPrompt()

  if (!canInstall) {
    return null
  }

  /** Triggers the captured beforeinstallprompt flow. */
  const handleInstall = () => {
    void promptInstall()
  }

  return (
    <Button
      type="button"
      variant="secondary"
      loading={isInstalling}
      loadingLabel="Preparing…"
      onClick={handleInstall}
      className={cn(
        'relative overflow-hidden border border-accent-border bg-card/80 px-4 py-2 shadow-sm backdrop-blur-sm',
        'hover:border-positive/40 hover:bg-positive-muted/30',
        className,
      )}
      aria-label="Install Trading Signal app"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-positive/15"
      />
      <span className="relative flex items-center gap-2">
        <Download className="h-4 w-4 text-positive" strokeWidth={2.25} />
        <span className="font-semibold text-foreground">Install app</span>
        <span
          aria-hidden="true"
          className="hidden h-1.5 w-1.5 rounded-full sm:inline-block"
          style={{ backgroundColor: PWA_ACCENT_COLOR }}
        />
      </span>
    </Button>
  )
}

export default InstallAppButton
