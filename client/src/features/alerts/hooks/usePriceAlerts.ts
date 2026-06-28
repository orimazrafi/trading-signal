import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPriceAlert,
  deletePriceAlert,
  fetchPriceAlerts,
  triggerAlertCheck,
  updatePriceAlert,
} from '@/api/alerts'
import { getApiErrorMessage } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import {
  getFirstApiErrorMessage,
  invalidateQueryKey,
  runMutationAndInvalidate,
} from '@/features/alerts/lib/alertQueryUtils'
import type { UsePriceAlertsOptions } from '@/features/alerts/types'
import { queryErrorHandledMeta } from '@/lib/queryMeta'
import type { CreatePriceAlertInput, PriceAlert, UpdatePriceAlertInput } from '@/types/alert'

/** Manages price alert CRUD for the authenticated user. */
export function usePriceAlerts({ enabled = true }: UsePriceAlertsOptions = {}) {
  const queryClient = useQueryClient()
  const alertsQueryKey = queryKeys.alerts.list

  const alertsQuery = useQuery({
    queryKey: alertsQueryKey,
    queryFn: ({ signal }) => fetchPriceAlerts({ signal }),
    enabled,
    meta: queryErrorHandledMeta,
  })

  const createMutation = useMutation({
    mutationFn: createPriceAlert,
    meta: queryErrorHandledMeta,
  })

  const updateMutation = useMutation({
    mutationFn: ({ alertId, input }: { alertId: string; input: UpdatePriceAlertInput }) =>
      updatePriceAlert(alertId, input),
    meta: queryErrorHandledMeta,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePriceAlert,
    meta: queryErrorHandledMeta,
  })

  const runCheckMutation = useMutation({
    mutationFn: triggerAlertCheck,
    meta: queryErrorHandledMeta,
  })

  /** Creates an alert and refreshes the list. */
  const createAlert = (input: CreatePriceAlertInput) =>
    runMutationAndInvalidate(queryClient, alertsQueryKey, () => createMutation.mutateAsync(input))

  /** Creates an alert from panel form fields and refreshes the list. */
  const createAlertFromFields = (
    symbol: string,
    thresholdPercent: number,
    emailEnabled: boolean,
  ) => createAlert({ symbol, thresholdPercent, emailEnabled })

  /** Updates an alert and refreshes the list. */
  const updateAlert = (alertId: string, input: UpdatePriceAlertInput) =>
    runMutationAndInvalidate(queryClient, alertsQueryKey, () =>
      updateMutation.mutateAsync({ alertId, input }),
    )

  /** Deletes an alert and refreshes the list. */
  const deleteAlert = (alertId: string) =>
    runMutationAndInvalidate(queryClient, alertsQueryKey, () =>
      deleteMutation.mutateAsync(alertId),
    )

  /** Toggles whether an alert is active. */
  const toggleAlertEnabled = (alert: PriceAlert, enabled: boolean) =>
    updateAlert(alert.id, { enabled })

  /** Toggles whether alert emails are sent. */
  const toggleAlertEmail = (alert: PriceAlert, emailEnabled: boolean) =>
    updateAlert(alert.id, { emailEnabled })

  /** Runs an immediate alert check (development only). */
  const runAlertCheck = async () => {
    await runCheckMutation.mutateAsync()
    await Promise.all([
      invalidateQueryKey(queryClient, alertsQueryKey),
      invalidateQueryKey(queryClient, queryKeys.alerts.notifications),
    ])
  }

  /** Re-arms a previously triggered alert for the same symbol. */
  const setUpAlertAgain = (alert: PriceAlert) =>
    createAlert({
      symbol: alert.symbol,
      thresholdPercent: alert.thresholdPercent,
      emailEnabled: alert.emailEnabled,
    })

  const error = getFirstApiErrorMessage([
    alertsQuery.error,
    createMutation.error,
    updateMutation.error,
    deleteMutation.error,
  ])

  const runCheckError = runCheckMutation.error == null ? null : getApiErrorMessage(runCheckMutation.error)

  return {
    alerts: alertsQuery.data ?? [],
    loading: alertsQuery.isLoading,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    runningCheck: runCheckMutation.isPending,
    runCheckError,
    error,
    createAlert,
    createAlertFromFields,
    setUpAlertAgain,
    updateAlert,
    deleteAlert,
    toggleAlertEnabled,
    toggleAlertEmail,
    runAlertCheck,
    reload: () => alertsQuery.refetch(),
  }
}
