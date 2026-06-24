import { type FormEvent, useState } from 'react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { CheckboxField } from '@/components/CheckboxField'
import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { FormField } from '@/components/FormField'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { toast } from '@/components/Toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    <Panel
      title="Price alerts"
      description={`Configure up to ${MAX_PRICE_ALERTS} active symbols. Checked every 5 minutes during US market hours. Each alert fires once when the threshold is crossed.`}
      variant="section"
    >
      {error ? <ErrorMessage message={error} className="mb-4" /> : null}

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

      {loading ? <LoadingSpinner label="Loading alerts…" /> : null}

      {!loading && alerts.length === 0 ? (
        <EmptyState message="No alerts yet. Add a symbol and threshold to get started." />
      ) : null}

      <ul className="space-y-3">
        {alerts.map((alert) => {
          const wasSent = alert.lastTriggeredAt !== null

          return (
            <li key={alert.id}>
              <Card variant="muted" className="shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {alert.symbol}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
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
                    <Badge variant="warning">Sent</Badge>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="secondary" disabled={deleting}>
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => void handleDelete(alert)}
                        >
                          Remove alert
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              </Card>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

export default PriceAlertsPanel
