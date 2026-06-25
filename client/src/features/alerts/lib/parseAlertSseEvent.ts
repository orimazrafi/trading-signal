import {
  parseAlertNotificationEvent,
  type AlertNotificationEvent,
} from '@trading-signal/contracts/alert'

export type ParseAlertSseEventResult =
  | { ok: true; notification: AlertNotificationEvent }
  | { ok: false }

/** Parses and validates a browser MessageEvent from the alert SSE stream. */
export function parseAlertSseEvent(event: Event): ParseAlertSseEventResult {
  if (!(event instanceof MessageEvent) || typeof event.data !== 'string') {
    return { ok: false }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(event.data)
  } catch {
    return { ok: false }
  }

  const notification = parseAlertNotificationEvent(parsed)

  if (!notification) {
    return { ok: false }
  }

  return { ok: true, notification }
}
