import { Button } from '@/components/Button'
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Alert history</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Past triggers from your configured price alerts.
        </p>
      </header>

      {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading history…</p> : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {!loading && notifications.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
          No triggered alerts yet.
        </p>
      ) : null}

      <ul className="space-y-3">
        {notifications.map((notification) => {
          const isUnread = notification.readAt === null
          const direction = notification.changePercent >= 0 ? 'up' : 'down'

          return (
            <li
              key={notification.id}
              className={`rounded-xl border p-4 ${
                isUnread
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40'
              }`}
            >
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
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      notification.emailSent
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {notification.emailSent ? 'Email sent' : 'No email'}
                  </span>

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
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default AlertHistoryPanel
