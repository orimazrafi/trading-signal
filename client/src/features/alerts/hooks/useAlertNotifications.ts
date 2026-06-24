import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchAlertNotifications, markAlertNotificationRead } from '@/api/alerts'
import {
  getFirstApiErrorMessage,
  runMutationAndInvalidate,
} from '@/features/alerts/lib/alertQueryUtils'
import { queryErrorHandledMeta } from '@/lib/queryMeta'
import type { UseAlertNotificationsOptions } from '@/features/alerts/types'

/** Loads alert notification history for the authenticated user. */
export function useAlertNotifications({ enabled = true }: UseAlertNotificationsOptions = {}) {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: queryKeys.alerts.notifications,
    queryFn: fetchAlertNotifications,
    enabled,
    meta: queryErrorHandledMeta,
  })

  const readMutation = useMutation({
    mutationFn: markAlertNotificationRead,
    meta: queryErrorHandledMeta,
  })

  /** Marks a notification read and refreshes the list. */
  const markRead = (notificationId: string) =>
    runMutationAndInvalidate(queryClient, queryKeys.alerts.notifications, () =>
      readMutation.mutateAsync(notificationId),
    )

  const error = getFirstApiErrorMessage([notificationsQuery.error, readMutation.error])

  return {
    notifications: notificationsQuery.data ?? [],
    loading: notificationsQuery.isLoading,
    markingRead: readMutation.isPending,
    error,
    markRead,
    reload: () => notificationsQuery.refetch(),
  }
}
