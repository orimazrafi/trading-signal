import { Badge } from '@/components/Badge'
import { AsyncListPanel } from '@/components/AsyncListPanel'
import { AlertHistoryCard } from '@/features/alerts/components/AlertHistoryCard'
import { countUnreadAlertNotifications } from '@/features/alerts/lib/alertNotificationUtils'
import type { AlertHistoryPanelProps } from './types'

/** Renders triggered alert notification history. */
function AlertHistoryPanel({
  notifications,
  loading,
  error,
  markingRead,
  resettingNotificationId,
  onMarkRead,
  onResetAlert,
  onRetry,
}: AlertHistoryPanelProps) {
  const unreadCount = countUnreadAlertNotifications(notifications)

  return (
    <AsyncListPanel
      title="Alert history"
      description="Past triggers from your configured price alerts. Unread items are bold — tap to mark read."
      variant="section"
      listClassName="space-y-2"
      header={
        !loading && unreadCount > 0 ? (
          <Badge variant="warning">{unreadCount} unread</Badge>
        ) : null
      }
      items={notifications}
      isLoading={loading}
      error={error}
      emptyMessage="No triggered alerts yet."
      loadingLabel="Loading history…"
      onRetry={onRetry}
      getItemKey={(notification) => notification.id}
      renderItem={(notification) => (
        <AlertHistoryCard
          notification={notification}
          markingRead={markingRead}
          resetting={resettingNotificationId === notification.id}
          onMarkRead={onMarkRead}
          onResetAlert={onResetAlert}
        />
      )}
    />
  )
}

export default AlertHistoryPanel
