import type { BeforeInstallPromptEvent } from './types'

/** Returns true when value is a plain object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Narrows a browser Event to the Chromium beforeinstallprompt event. */
export function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  if (!isRecord(event)) {
    return false
  }

  return typeof event.prompt === 'function'
}
