import { useEffect, useRef, useState } from 'react'
import { toast } from '@/components/Toast'
import { getAlertStreamUrl } from '@/api/alerts'
import { parseAlertSseEvent } from '@/features/alerts/lib/parseAlertSseEvent'
import { SSE_INITIAL_RETRY_MS, SSE_MAX_RETRY_MS } from '@/lib/sseConstants'
import type { AlertNotificationEvent } from '@trading-signal/contracts/alert'

type UseAlertEventStreamOptions = {
  enabled?: boolean
  onNotification: (notification: AlertNotificationEvent) => void
}

/** Subscribes to the alert SSE stream with reconnect backoff and validated events. */
export function useAlertEventStream({
  enabled = true,
  onNotification,
}: UseAlertEventStreamOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const onNotificationRef = useRef(onNotification)
  onNotificationRef.current = onNotification

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false)
      return
    }

    let disposed = false
    let retryMs = SSE_INITIAL_RETRY_MS
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let source: EventSource | null = null

    /** Resets reconnect delay after a successful alert delivery. */
    const resetRetryDelay = () => {
      retryMs = SSE_INITIAL_RETRY_MS
    }

    /** Handles one validated alert event from the server. */
    const handleAlert: EventListener = (event) => {
      const result = parseAlertSseEvent(event)

      if (!result.ok) {
        toast.error('Received an invalid alert notification.')
        return
      }

      resetRetryDelay()
      onNotificationRef.current(result.notification)
    }

    /** Schedules the next reconnect attempt with exponential backoff. */
    const scheduleReconnect = (connect: () => void) => {
      retryTimer = setTimeout(() => {
        retryMs = Math.min(retryMs * 2, SSE_MAX_RETRY_MS)
        connect()
      }, retryMs)
    }

    /** Opens the EventSource and wires open, message, and error handlers. */
    const connect = () => {
      if (disposed) {
        return
      }

      source = new EventSource(getAlertStreamUrl(), { withCredentials: true })
      source.addEventListener('alert', handleAlert)

      source.onopen = () => {
        if (!disposed) {
          setIsConnected(true)
        }
      }

      source.onerror = () => {
        setIsConnected(false)
        source?.removeEventListener('alert', handleAlert)
        source?.close()
        source = null

        if (disposed) {
          return
        }

        scheduleReconnect(connect)
      }
    }

    connect()

    return () => {
      disposed = true
      setIsConnected(false)

      if (retryTimer) {
        clearTimeout(retryTimer)
      }

      source?.removeEventListener('alert', handleAlert)
      source?.close()
    }
  }, [enabled])

  return { isConnected }
}
