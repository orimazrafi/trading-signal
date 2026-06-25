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
      className="shadow-none p-3"
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
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              className={cn(
                'text-sm',
                isUnread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground',
              )}
            >
              {notification.symbol}
            </h3>
            {isUnread ? <Badge variant="warning" size="sm">Unread</Badge> : null}
            <Badge variant={notification.emailSent ? 'positive' : 'muted'} size="sm">
              {notification.emailSent ? 'Email sent' : 'No email'}
            </Badge>
          </div>
          <p
            className={cn(
              'mt-0.5 text-xs leading-snug',
              isUnread ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            Moved {direction} {Math.abs(notification.changePercent).toFixed(2)}% to $
            {notification.price.toFixed(2)}
            <span className="text-muted-foreground/80">
              {' '}
              · Baseline ${notification.baselinePrice.toFixed(2)} ·{' '}
              {new Date(notification.createdAt).toLocaleString(undefined, {
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </p>
        </div>

        {onResetAlert ? (
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 px-2.5 py-1 text-xs"
            disabled={resetting}
            loading={resetting}
            loadingLabel="Resetting…"
            onClick={handleResetAlert}
          >
            Reset
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

export default AlertHistoryCard
