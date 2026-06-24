import { type FormEvent, useState } from 'react'
import { Button } from '@/components/Button'
import { CheckboxField } from '@/components/CheckboxField'
import { FormField } from '@/components/FormField'
import { toast } from '@/components/Toast'
import {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
  MAX_PRICE_ALERTS,
  type PriceAlert,
} from '@/types/alert'
import { parsePriceAlertForm } from '@/features/alerts/lib/priceAlertFormUtils'
import type { PriceAlertsPanelProps } from './types'

/** Configures up to three price alerts for the signed-in user. */
function PriceAlertsPanel({
  userEmail,
  alerts,
  loading,
  creating,
  updating,
  deleting,
  error,
  onCreate,
  onToggleEnabled,
  onToggleEmail,
  onDelete,
}: PriceAlertsPanelProps) {
  const [symbolInput, setSymbolInput] = useState('')
  const [thresholdInput, setThresholdInput] = useState('3')
  const [emailEnabled, setEmailEnabled] = useState(true)

  const activeAlertCount = alerts.filter((alert) => alert.lastTriggeredAt === null).length
  const canAddMore = activeAlertCount < MAX_PRICE_ALERTS

  /** Creates a new alert from the form inputs. */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const parsed = parsePriceAlertForm({ symbolInput, thresholdInput })
    if (parsed.ok === false) {
      toast.error(parsed.error)
      return
    }

    try {
      await onCreate(parsed.value.symbol, parsed.value.thresholdPercent, emailEnabled)
      setSymbolInput('')
      setEmailEnabled(true)
      toast.success(`${parsed.value.symbol} alert created.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to create alert.')
    }
  }

  /** Deletes an alert and surfaces feedback. */
  const handleDelete = async (alert: PriceAlert) => {
    try {
      await onDelete(alert.id)
      toast.success(`${alert.symbol} alert removed.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to remove alert.')
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Price alerts</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure up to {MAX_PRICE_ALERTS} active symbols. Checked every 5 minutes during US
          market hours. Each alert fires once when the threshold is crossed.
        </p>
      </header>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {canAddMore ? (
        <form className="mb-5 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_8rem_auto]">
            <FormField
              label="Symbol"
              value={symbolInput}
              onChange={setSymbolInput}
              placeholder="AAPL"
            />

            <FormField
              label="Threshold %"
              type="number"
              min={ALERT_MIN_THRESHOLD_PERCENT}
              max={ALERT_MAX_THRESHOLD_PERCENT}
              step="0.1"
              value={thresholdInput}
              onChange={setThresholdInput}
            />

            <Button type="submit" loading={creating} loadingLabel="Adding…">
              Add alert
            </Button>
          </div>

          <CheckboxField
            label="Email me when this alert triggers"
            checked={emailEnabled}
            onChange={setEmailEnabled}
          />
          {emailEnabled ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sent to your account email: {userEmail}
            </p>
          ) : null}
        </form>
      ) : (
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          You reached the limit of {MAX_PRICE_ALERTS} alerts. Remove one to add another.
        </p>
      )}

      {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading alerts…</p> : null}

      {!loading && alerts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
          No alerts yet. Add a symbol and threshold to get started.
        </p>
      ) : null}

      <ul className="space-y-3">
        {alerts.map((alert) => {
          const wasSent = alert.lastTriggeredAt !== null

          return (
            <li
              key={alert.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {alert.symbol}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Alert when price moves ±{alert.thresholdPercent.toFixed(2)}% from $
                    {alert.baselinePrice.toFixed(2)}
                  </p>
                  {wasSent && alert.lastTriggeredAt ? (
                    <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                      Sent · {new Date(alert.lastTriggeredAt).toLocaleString()}
                      {alert.emailEnabled ? ' · Email enabled' : ' · In-app only'}
                    </p>
                  ) : null}
                </div>

                {wasSent ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    Sent
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deleting}
                    onClick={() => void handleDelete(alert)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              {!wasSent ? (
                <div className="mt-4 flex flex-wrap gap-4">
                  <CheckboxField
                    label="Enabled"
                    checked={alert.enabled}
                    disabled={updating}
                    onChange={(checked) => void onToggleEnabled(alert, checked)}
                  />

                  <CheckboxField
                    label={`Email me (${userEmail})`}
                    checked={alert.emailEnabled}
                    disabled={updating}
                    onChange={(checked) => void onToggleEmail(alert, checked)}
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default PriceAlertsPanel
