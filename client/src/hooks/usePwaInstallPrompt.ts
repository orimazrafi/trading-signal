import { useCallback, useState } from 'react'
import { useBeforeInstallPrompt } from '@/hooks/useBeforeInstallPrompt'
import type { UsePwaInstallPromptResult } from '@/hooks/types'
import type { PwaInstallOutcome } from '@/lib/pwa/types'

/** Listens for beforeinstallprompt and exposes a native install trigger. */
export function usePwaInstallPrompt(): UsePwaInstallPromptResult {
  const { installPrompt, setInstallPrompt, isInstalled } = useBeforeInstallPrompt()
  const [isInstalling, setIsInstalling] = useState(false)

  /** Opens the browser's native install dialog when available. */
  const promptInstall = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (!installPrompt) {
      return 'unavailable'
    }

    setIsInstalling(true)

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice

      if (choice.outcome === 'accepted') {
        setInstallPrompt(null)
        return 'accepted'
      }

      return 'dismissed'
    } finally {
      setIsInstalling(false)
    }
  }, [installPrompt, setInstallPrompt])

  return {
    canInstall: Boolean(installPrompt) && !isInstalled,
    isInstalling,
    promptInstall,
  }
}
