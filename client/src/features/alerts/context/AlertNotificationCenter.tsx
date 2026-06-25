import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAlertEventStream } from '@/features/alerts/hooks/useAlertEventStream'
import { invalidateAlertQueries } from '@/features/alerts/lib/alertQueryUtils'
import { showAlertTriggeredToast } from '@/features/alerts/lib/showAlertTriggeredToast'
import { ROUTES } from '@/routes/paths'
import type { AlertNotificationEvent } from '@trading-signal/contracts/alert'
import type { AlertNotificationCenterContextValue } from './types'

const AlertNotificationCenterContext = createContext<AlertNotificationCenterContextValue | null>(
  null,
)

type AlertNotificationCenterProviderProps = {
  children: ReactNode
  enabled?: boolean
}

/** Provides SSE-driven alert toasts and cache invalidation for the signed-in session. */
export function AlertNotificationCenterProvider({
  children,
  enabled = true,
}: AlertNotificationCenterProviderProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  /** Surfaces a pushed alert and refreshes alert-related React Query caches. */
  const handleAlertNotification = useCallback(
    (notification: AlertNotificationEvent) => {
      showAlertTriggeredToast(
        notification.symbol,
        notification.changePercent,
        notification.price,
        (symbol) => navigate(ROUTES.watchlistSymbol(symbol)),
      )
      invalidateAlertQueries(queryClient)
    },
    [navigate, queryClient],
  )

  const { isConnected } = useAlertEventStream({
    enabled,
    onNotification: handleAlertNotification,
  })

  const value = useMemo<AlertNotificationCenterContextValue>(
    () => ({ isConnected }),
    [isConnected],
  )

  return (
    <AlertNotificationCenterContext.Provider value={value}>
      {children}
    </AlertNotificationCenterContext.Provider>
  )
}

/** Reads alert SSE connection state from AlertNotificationCenterProvider. */
export function useAlertNotificationCenter(): AlertNotificationCenterContextValue {
  const context = useContext(AlertNotificationCenterContext)

  if (!context) {
    throw new Error('useAlertNotificationCenter must be used within AlertNotificationCenterProvider')
  }

  return context
}
