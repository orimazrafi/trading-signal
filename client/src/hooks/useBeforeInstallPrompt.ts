import { useCallback, useState } from 'react'
import type { UseBeforeInstallPromptResult } from '@/hooks/types'
import { usePwaInstallBrowserEvents } from '@/hooks/usePwaInstallBrowserEvents'
import { isAppInstalled } from '@/lib/pwa/isAppInstalled'
import type { BeforeInstallPromptEvent } from '@/lib/pwa/types'

/** Tracks the deferred install prompt and whether the app is already installed. */
export function useBeforeInstallPrompt(): UseBeforeInstallPromptResult {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => isAppInstalled())

  /** Clears the prompt after the browser reports a successful install. */
  const handleAppInstalled = useCallback(() => {
    setIsInstalled(true)
    setInstallPrompt(null)
  }, [])

  usePwaInstallBrowserEvents({
    onBeforeInstallPrompt: setInstallPrompt,
    onAppInstalled: handleAppInstalled,
  })

  return { installPrompt, setInstallPrompt, isInstalled }
}
