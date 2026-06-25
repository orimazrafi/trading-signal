import type { BeforeInstallPromptEvent, PwaInstallOutcome } from '@/lib/pwa/types'

/** Options for the Intersection Observer viewport hook. */
export type UseIntersectionObserverOptions = {
  enabled?: boolean
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  /** When true, stops observing after the target first becomes visible. */
  freezeOnceVisible?: boolean
}

/** Result of useIntersectionObserver — ref callback plus visibility flag. */
export type UseIntersectionObserverResult = {
  ref: (node: Element | null) => void
  isIntersecting: boolean
}

/** Handlers for PWA install browser events wired by usePwaInstallBrowserEvents. */
export type PwaInstallBrowserEventHandlers = {
  onBeforeInstallPrompt: (event: BeforeInstallPromptEvent) => void
  onAppInstalled: () => void
}

/** Result of useBeforeInstallPrompt — captured install prompt and install state. */
export type UseBeforeInstallPromptResult = {
  installPrompt: BeforeInstallPromptEvent | null
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void
  isInstalled: boolean
}

/** Result of usePwaInstallPrompt for the Install App button. */
export type UsePwaInstallPromptResult = {
  canInstall: boolean
  isInstalling: boolean
  promptInstall: () => Promise<PwaInstallOutcome>
}
