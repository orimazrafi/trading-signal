import { AlertHistoryPanel } from '@/features/alerts/components/AlertHistoryPanel'
import { PriceAlertsPanel } from '@/features/alerts/components/PriceAlertsPanel'
import { useAlertNotifications } from '@/features/alerts/hooks/useAlertNotifications'
import { usePriceAlerts } from '@/features/alerts/hooks/usePriceAlerts'

export type AlertsTabProps = {
  userEmail: string
}

/** Alerts tab for configuring price alerts and reviewing history. */
function AlertsTab({ userEmail }: AlertsTabProps) {
  const {
    alerts,
    loading,
    creating,
    updating,
    deleting,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
  } = usePriceAlerts()

  const {
    notifications,
    loading: historyLoading,
    error: historyError,
    markingRead,
    markRead,
  } = useAlertNotifications()

  /** Creates a configured alert for the signed-in user. */
  const handleCreate = async (symbol: string, thresholdPercent: number, emailEnabled: boolean) => {
    await createAlert({ symbol, thresholdPercent, emailEnabled })
  }

  /** Toggles whether an alert is active. */
  const handleToggleEnabled = async (alert: { id: string }, enabled: boolean) => {
    await updateAlert(alert.id, { enabled })
  }

  /** Toggles whether alert emails are sent. */
  const handleToggleEmail = async (alert: { id: string }, emailEnabled: boolean) => {
    await updateAlert(alert.id, { emailEnabled })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PriceAlertsPanel
        userEmail={userEmail}
        alerts={alerts}
        loading={loading}
        creating={creating}
        updating={updating}
        deleting={deleting}
        error={error}
        onCreate={handleCreate}
        onToggleEnabled={handleToggleEnabled}
        onToggleEmail={handleToggleEmail}
        onDelete={deleteAlert}
      />

      <AlertHistoryPanel
        notifications={notifications}
        loading={historyLoading}
        error={historyError}
        markingRead={markingRead}
        onMarkRead={markRead}
      />
    </div>
  )
}

export default AlertsTab
