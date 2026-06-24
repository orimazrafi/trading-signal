import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
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
        {notifications.map((notification) => {
          const isUnread = notification.readAt === null
          const direction = notification.changePercent >= 0 ? 'up' : 'down'

          return (
            <li key={notification.id}>
              <Card variant={isUnread ? 'unread' : 'muted'} className="shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {notification.symbol}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Moved {direction} {Math.abs(notification.changePercent).toFixed(2)}% to $
                      {notification.price.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      Baseline ${notification.baselinePrice.toFixed(2)} ·{' '}
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={notification.emailSent ? 'positive' : 'muted'}>
                      {notification.emailSent ? 'Email sent' : 'No email'}
                    </Badge>

                    {isUnread ? (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={markingRead}
                        onClick={() => void onMarkRead(notification.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export default AlertHistoryPanel
