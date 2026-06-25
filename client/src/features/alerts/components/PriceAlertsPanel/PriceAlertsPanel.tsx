import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { PriceAlertCard } from '@/features/alerts/components/PriceAlertCard'
import { PriceAlertCreateForm } from '@/features/alerts/components/PriceAlertCreateForm'
import { MAX_PRICE_ALERTS } from '@/types/alert'
import { isActivePriceAlert } from '@/features/alerts/lib/priceAlertStatus'
import type { PriceAlertsPanelProps } from './types'
import type { PriceAlert } from '@/types/alert'

/** Counts alerts that are still armed and eligible to fire. */
function countActiveAlerts(alerts: PriceAlert[]): number {
  return alerts.filter((alert) => isActivePriceAlert(alert)).length
}

/** Splits alerts into active and previously triggered rows. */
function partitionAlerts(alerts: PriceAlert[]) {
  const activeAlerts: PriceAlert[] = []
  const sentAlerts: PriceAlert[] = []

  for (const alert of alerts) {
    if (isActivePriceAlert(alert)) {
      activeAlerts.push(alert)
      continue
    }

    sentAlerts.push(alert)
  }

  return { activeAlerts, sentAlerts }
}

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
  onSetUpAgain,
}: PriceAlertsPanelProps) {
  const { activeAlerts, sentAlerts } = partitionAlerts(alerts)
  const canAddMore = countActiveAlerts(alerts) < MAX_PRICE_ALERTS

  return (
    <Panel
      title="Price alerts"
      description={`Configure up to ${MAX_PRICE_ALERTS} active symbols. Checked every 5 minutes during US market hours. After an alert fires, set it up again for the same symbol.`}
      variant="section"
    >
      {error ? <ErrorMessage message={error} className="mb-4" /> : null}

      {canAddMore ? (
        <PriceAlertCreateForm userEmail={userEmail} creating={creating} onCreate={onCreate} />
      ) : (
        <p className="mb-5 text-sm text-muted-foreground">
          You reached the limit of {MAX_PRICE_ALERTS} alerts. Remove one to add another.
        </p>
      )}

      {loading ? <LoadingSpinner label="Loading alerts…" /> : null}

      {!loading && activeAlerts.length === 0 && sentAlerts.length === 0 ? (
        <EmptyState message="No alerts yet. Add a symbol and threshold to get started." />
      ) : null}

      <ul className="space-y-3">
        {activeAlerts.map((alert) => (
          <li key={alert.id}>
            <PriceAlertCard
              alert={alert}
              userEmail={userEmail}
              updating={updating}
              deleting={deleting}
              onToggleEnabled={onToggleEnabled}
              onToggleEmail={onToggleEmail}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>

      {sentAlerts.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">Previously sent</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Set up a symbol again with a fresh baseline price, or remove it to free a slot.
          </p>
          <ul className="mt-3 space-y-3">
            {sentAlerts.map((alert) => (
              <li key={alert.id}>
                <PriceAlertCard
                  alert={alert}
                  userEmail={userEmail}
                  updating={updating}
                  deleting={deleting}
                  settingUpAgain={creating}
                  onToggleEnabled={onToggleEnabled}
                  onToggleEmail={onToggleEmail}
                  onDelete={onDelete}
                  onSetUpAgain={onSetUpAgain}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  )
}

export default PriceAlertsPanel
