/** Returns true when value is a plain object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Returns true when the app is running as an installed PWA. */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }

  if (isRecord(navigator) && navigator.standalone === true) {
    return true
  }

  return false
}
