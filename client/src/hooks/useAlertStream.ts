import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/Toast'
import { getAlertStreamUrl } from '@/api/alerts'
import { queryKeys } from '@/api/queryKeys'
import type { AlertNotificationEvent } from '@/types/alert'

/** Subscribes to server-sent alert events and surfaces them as toasts. */
export function useAlertStream(enabled = true) {
  const queryClient = useQueryClient()
  const sourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const source = new EventSource(getAlertStreamUrl(), { withCredentials: true })
    sourceRef.current = source

    /** Handles a pushed alert notification event. */
    const handleAlert = (event: MessageEvent<string>) => {
      try {
        const notification = JSON.parse(event.data) as AlertNotificationEvent
        const direction = notification.changePercent >= 0 ? 'up' : 'down'

        toast.warning(
          `${notification.symbol} moved ${direction} ${Math.abs(notification.changePercent).toFixed(2)}%`,
        )

        void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.notifications })
      } catch {
        toast.error('Received an invalid alert notification.')
      }
    }

    source.addEventListener('alert', handleAlert as EventListener)

    source.onerror = () => {
      source.close()
    }

    return () => {
      source.removeEventListener('alert', handleAlert as EventListener)
      source.close()
      sourceRef.current = null
    }
  }, [enabled, queryClient])
}
