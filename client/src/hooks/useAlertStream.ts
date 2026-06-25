import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/Toast'
import { getAlertStreamUrl } from '@/api/alerts'
import { queryKeys } from '@/api/queryKeys'
import { SSE_INITIAL_RETRY_MS, SSE_MAX_RETRY_MS } from '@/lib/sseConstants'
import { parseAlertNotificationEvent } from '@trading-signal/contracts/alert'

/** Subscribes to server-sent alert events with reconnect backoff and surfaces toasts. */
export function useAlertStream(enabled = true) {
  const queryClient = useQueryClient()
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let disposed = false
    let retryMs = SSE_INITIAL_RETRY_MS
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let source: EventSource | null = null

    /** Handles a pushed alert notification event. */
    const handleAlert: EventListener = (event) => {
      if (!(event instanceof MessageEvent) || typeof event.data !== 'string') {
        return
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(event.data)
      } catch {
        toast.error('Received an invalid alert notification.')
        return
      }

      const notification = parseAlertNotificationEvent(parsed)
      if (!notification) {
        toast.error('Received an invalid alert notification.')
        return
      }

      retryMs = SSE_INITIAL_RETRY_MS
      const direction = notification.changePercent >= 0 ? 'up' : 'down'

      toast.warning(
        `${notification.symbol} moved ${direction} ${Math.abs(notification.changePercent).toFixed(2)}%`,
      )

      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.notifications })
    }

    /** Opens the SSE connection and wires lifecycle handlers. */
    const connect = () => {
      if (disposed) {
        return
      }

      source = new EventSource(getAlertStreamUrl(), { withCredentials: true })
      sourceRef.current = source
      source.addEventListener('alert', handleAlert)

      source.onerror = () => {
        source?.removeEventListener('alert', handleAlert)
        source?.close()
        source = null
        sourceRef.current = null

        if (disposed) {
          return
        }

        retryTimer = setTimeout(() => {
          retryMs = Math.min(retryMs * 2, SSE_MAX_RETRY_MS)
          connect()
        }, retryMs)
      }
    }

    connect()

    return () => {
      disposed = true
      if (retryTimer) {
        clearTimeout(retryTimer)
      }
      source?.removeEventListener('alert', handleAlert)
      source?.close()
      sourceRef.current = null
    }
  }, [enabled, queryClient])
}
