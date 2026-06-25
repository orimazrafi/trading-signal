import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
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
}: AlertHistoryPanelProps) {
  const unreadCount = countUnreadAlertNotifications(notifications)

  return (
    <Panel
      title="Alert history"
      description="Past triggers from your configured price alerts. Unread items are bold — tap to mark read."
      variant="section"
    >
      {!loading && unreadCount > 0 ? (
        <div className="mb-4">
          <Badge variant="warning">{unreadCount} unread</Badge>
        </div>
      ) : null}

      {loading ? <LoadingSpinner label="Loading history…" /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {!loading && notifications.length === 0 ? (
        <EmptyState message="No triggered alerts yet." />
      ) : null}

      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <AlertHistoryCard
              notification={notification}
              markingRead={markingRead}
              resetting={resettingNotificationId === notification.id}
              onMarkRead={onMarkRead}
              onResetAlert={onResetAlert}
            />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export default AlertHistoryPanel
