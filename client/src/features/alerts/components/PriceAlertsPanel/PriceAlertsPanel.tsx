import { EmptyState } from '@/components/EmptyState'
import { ErrorMessage } from '@/components/ErrorMessage'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Panel } from '@/components/Panel'
import { PriceAlertCard } from '@/features/alerts/components/PriceAlertCard'
import { PriceAlertCreateForm } from '@/features/alerts/components/PriceAlertCreateForm'
import { MAX_PRICE_ALERTS } from '@/types/alert'
import type { PriceAlertsPanelProps } from './types'

/** Counts alerts that have not yet fired. */
function countActiveAlerts(alerts: PriceAlertsPanelProps['alerts']): number {
  return alerts.filter((alert) => alert.lastTriggeredAt === null).length
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
}: PriceAlertsPanelProps) {
  const canAddMore = countActiveAlerts(alerts) < MAX_PRICE_ALERTS

  return (
    <Panel
      title="Price alerts"
      description={`Configure up to ${MAX_PRICE_ALERTS} active symbols. Checked every 5 minutes during US market hours. Each alert fires once when the threshold is crossed.`}
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

      {!loading && alerts.length === 0 ? (
        <EmptyState message="No alerts yet. Add a symbol and threshold to get started." />
      ) : null}

      <ul className="space-y-3">
        {alerts.map((alert) => (
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
    </Panel>
  )
}

export default PriceAlertsPanel
