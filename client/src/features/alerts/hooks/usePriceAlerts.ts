import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import {
  createPriceAlert,
  deletePriceAlert,
  fetchPriceAlerts,
  updatePriceAlert,
} from '@/api/alerts'
import type { CreatePriceAlertInput, UpdatePriceAlertInput } from '@/types/alert'

/** Returns the first error message from a list of query/mutation errors. */
function getFirstErrorMessage(errors: unknown[]): string | null {
  const firstError = errors.find((error) => error != null)
  return firstError == null ? null : getApiErrorMessage(firstError)
}

/** Manages price alert CRUD for the authenticated user. */
export function usePriceAlerts(enabled = true) {
  const queryClient = useQueryClient()

  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.list,
    queryFn: fetchPriceAlerts,
    enabled,
  })

  const createMutation = useMutation({
    mutationFn: (input: CreatePriceAlertInput) => createPriceAlert(input),
  })

  const updateMutation = useMutation({
    mutationFn: ({ alertId, input }: { alertId: string; input: UpdatePriceAlertInput }) =>
      updatePriceAlert(alertId, input),
  })

  const deleteMutation = useMutation({
    mutationFn: (alertId: string) => deletePriceAlert(alertId),
  })

  /** Refetches alerts after a successful mutation. */
  const refreshAlerts = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.alerts.list })

  /** Creates an alert and refreshes the list. */
  const createAlert = async (input: CreatePriceAlertInput) => {
    const alert = await createMutation.mutateAsync(input)
    await refreshAlerts()
    return alert
  }

  /** Updates an alert and refreshes the list. */
  const updateAlert = async (alertId: string, input: UpdatePriceAlertInput) => {
    const alert = await updateMutation.mutateAsync({ alertId, input })
    await refreshAlerts()
    return alert
  }

  /** Deletes an alert and refreshes the list. */
  const deleteAlert = async (alertId: string) => {
    await deleteMutation.mutateAsync(alertId)
    await refreshAlerts()
  }

  const error = getFirstErrorMessage([
    alertsQuery.error,
    createMutation.error,
    updateMutation.error,
    deleteMutation.error,
  ])

  return {
    alerts: alertsQuery.data ?? [],
    loading: alertsQuery.isLoading,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    reload: () => alertsQuery.refetch(),
  }
}
