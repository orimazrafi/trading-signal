import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { AlertHistoryCard } from '@/features/alerts/components/AlertHistoryCard'
import type { AlertHistoryPanelProps } from './types'

/** Renders triggered alert notification history. */
function AlertHistoryPanel({
  notifications,
  loading,
  error,
  markingRead,
  onMarkRead,
}: AlertHistoryPanelProps) {
  return (
    <Panel
      title="Alert history"
      description="Past triggers from your configured price alerts."
      variant="section"
    >
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
              onMarkRead={onMarkRead}
            />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export default AlertHistoryPanel
