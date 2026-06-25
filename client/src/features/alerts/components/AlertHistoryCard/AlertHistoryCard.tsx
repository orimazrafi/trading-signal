import type { MouseEvent } from 'react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { cn } from '@/lib/utils'
import type { AlertHistoryCardProps } from './types'

/** Renders one triggered alert notification in the history list. */
function AlertHistoryCard({
  notification,
  markingRead,
  resetting,
  onMarkRead,
  onResetAlert,
}: AlertHistoryCardProps) {
  const isUnread = notification.readAt === null
  const direction = notification.changePercent >= 0 ? 'up' : 'down'

  /** Marks the notification read when the row is opened. */
  const handleOpen = () => {
    if (!isUnread || markingRead) {
      return
    }

    void onMarkRead(notification.id)
  }

  /** Re-arms the alert without marking the row as read. */
  const handleResetAlert = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (!onResetAlert) {
      return
    }

    void onResetAlert(notification)
  }

  return (
    <Card
      variant={isUnread ? 'unread' : 'muted'}
      className="shadow-none"
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpen()
        }
      }}
      role={isUnread ? 'button' : undefined}
      tabIndex={isUnread ? 0 : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            className={cn(
              'text-lg text-foreground',
              isUnread ? 'font-bold' : 'font-medium text-muted-foreground',
            )}
          >
            {notification.symbol}
          </h3>
          <p
            className={cn(
              'mt-1 text-sm',
              isUnread ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground',
            )}
          >
            Moved {direction} {Math.abs(notification.changePercent).toFixed(2)}% to $
            {notification.price.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            Baseline ${notification.baselinePrice.toFixed(2)} ·{' '}
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isUnread ? <Badge variant="warning">Unread</Badge> : null}
          <Badge variant={notification.emailSent ? 'positive' : 'muted'}>
            {notification.emailSent ? 'Email sent' : 'No email'}
          </Badge>
        </div>
      </div>

      {onResetAlert ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="primary"
            disabled={resetting}
            loading={resetting}
            loadingLabel="Resetting…"
            onClick={handleResetAlert}
          >
            Reset alert
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

export default AlertHistoryCard
