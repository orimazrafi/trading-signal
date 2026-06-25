import { useEffect, useRef } from 'react'
import type { PwaInstallBrowserEventHandlers } from '@/hooks/types'
import { isBeforeInstallPromptEvent } from '@/lib/pwa/isBeforeInstallPromptEvent'

/** Wires beforeinstallprompt and appinstalled window listeners for PWA install. */
export function usePwaInstallBrowserEvents(handlers: PwaInstallBrowserEventHandlers): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    /** Captures the deferred install prompt so we can show a custom button. */
    const handleBeforeInstallPrompt = (event: Event) => {
      if (!isBeforeInstallPromptEvent(event)) {
        return
      }

      event.preventDefault()
      handlersRef.current.onBeforeInstallPrompt(event)
    }

    /** Hides the install button after a successful installation. */
    const handleAppInstalled = () => {
      handlersRef.current.onAppInstalled()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
}
