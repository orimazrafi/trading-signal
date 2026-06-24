import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import type { AlertHistoryCardProps } from './types'

/** Renders one triggered alert notification in the history list. */
function AlertHistoryCard({ notification, markingRead, onMarkRead }: AlertHistoryCardProps) {
  const isUnread = notification.readAt === null
  const direction = notification.changePercent >= 0 ? 'up' : 'down'

  return (
    <Card variant={isUnread ? 'unread' : 'muted'} className="shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{notification.symbol}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Moved {direction} {Math.abs(notification.changePercent).toFixed(2)}% to $
            {notification.price.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
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
  )
}

export default AlertHistoryCard
