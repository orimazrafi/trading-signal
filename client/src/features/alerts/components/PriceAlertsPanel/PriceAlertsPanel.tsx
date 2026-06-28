import { AsyncListPanel } from '@/components/AsyncListPanel'
import { PriceAlertCard } from '@/features/alerts/components/PriceAlertCard'
import { PriceAlertCreateForm } from '@/features/alerts/components/PriceAlertCreateForm'
import { isActivePriceAlert } from '@/features/alerts/lib/priceAlertStatus'
import { MAX_PRICE_ALERTS } from '@/types/alert'
import type { PriceAlert } from '@/types/alert'
import type { PriceAlertsPanelProps } from './types'

/** Returns alerts that are still armed and eligible to fire. */
function listActiveAlerts(alerts: PriceAlert[]): PriceAlert[] {
  return alerts.filter((alert) => isActivePriceAlert(alert))
}

/** Counts alerts that are still armed and eligible to fire. */
function countActiveAlerts(alerts: PriceAlert[]): number {
  return listActiveAlerts(alerts).length
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
  onRetry,
}: PriceAlertsPanelProps) {
  const activeAlerts = listActiveAlerts(alerts)
  const canAddMore = countActiveAlerts(alerts) < MAX_PRICE_ALERTS

  return (
    <AsyncListPanel
      title="Price alerts"
      description={`Configure up to ${MAX_PRICE_ALERTS} active symbols. Checked every 5 minutes during US market hours. After an alert fires, reset it from Alert history.`}
      variant="section"
      header={
        canAddMore ? (
          <PriceAlertCreateForm userEmail={userEmail} creating={creating} onCreate={onCreate} />
        ) : (
          <p className="text-sm text-muted-foreground">
            You reached the limit of {MAX_PRICE_ALERTS} alerts. Remove one to add another.
          </p>
        )
      }
      items={activeAlerts}
      isLoading={loading}
      error={error}
      emptyMessage="No active alerts. Add a symbol or reset one from Alert history."
      loadingLabel="Loading alerts…"
      onRetry={onRetry}
      getItemKey={(alert) => alert.id}
      renderItem={(alert) => (
        <PriceAlertCard
          alert={alert}
          userEmail={userEmail}
          updating={updating}
          deleting={deleting}
          onToggleEnabled={onToggleEnabled}
          onToggleEmail={onToggleEmail}
          onDelete={onDelete}
        />
      )}
    />
  )
}

export default PriceAlertsPanel
