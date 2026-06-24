import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { fetchAlertNotifications, markAlertNotificationRead } from '@/api/alerts'

/** Loads alert notification history for the authenticated user. */
export function useAlertNotifications(enabled = true) {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: queryKeys.alerts.notifications,
    queryFn: fetchAlertNotifications,
    enabled,
  })

  const readMutation = useMutation({
    mutationFn: (notificationId: string) => markAlertNotificationRead(notificationId),
  })

  /** Refetches notifications after marking one as read. */
  const refreshNotifications = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.alerts.notifications })

  /** Marks a notification read and refreshes the list. */
  const markRead = async (notificationId: string) => {
    const notification = await readMutation.mutateAsync(notificationId)
    await refreshNotifications()
    return notification
  }

  const error =
    notificationsQuery.error instanceof Error ? notificationsQuery.error.message : null

  return {
    notifications: notificationsQuery.data ?? [],
    loading: notificationsQuery.isLoading,
    markingRead: readMutation.isPending,
    error,
    markRead,
    reload: () => notificationsQuery.refetch(),
  }
}
