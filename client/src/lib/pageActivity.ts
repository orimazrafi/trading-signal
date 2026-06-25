/** Page Visibility API + window focus helpers for pausing background work. */

type PageActivityListener = (isActive: boolean) => void

const listeners = new Set<PageActivityListener>()

/** Returns true when the tab is visible and the browser window has keyboard focus. */
export function isPageActive(): boolean {
  if (typeof document === 'undefined') {
    return true
  }

  return !document.hidden && document.hasFocus()
}

/** Notifies subscribers when tab visibility or window focus changes. */
function notifyPageActivityListeners(): void {
  const isActive = isPageActive()

  listeners.forEach((listener) => {
    listener(isActive)
  })
}

/** Subscribes to combined Page Visibility and window focus/blur changes. */
export function subscribePageActivity(listener: PageActivityListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', notifyPageActivityListeners)
  window.addEventListener('focus', notifyPageActivityListeners)
  window.addEventListener('blur', notifyPageActivityListeners)
}
