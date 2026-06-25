import { AlertHistoryPanel } from '@/features/alerts/components/AlertHistoryPanel'
import { AlertRunCheckToolbar } from '@/features/alerts/components/AlertRunCheckToolbar'
import { PriceAlertsPanel } from '@/features/alerts/components/PriceAlertsPanel'
import { useAlertNotifications } from '@/features/alerts/hooks/useAlertNotifications'
import { usePriceAlerts } from '@/features/alerts/hooks/usePriceAlerts'
import type { AlertsTabProps } from './types'

/** Alerts tab for configuring price alerts and reviewing history. */
function AlertsTab({ userEmail }: AlertsTabProps) {
  const {
    alerts,
    loading,
    creating,
    updating,
    deleting,
    runningCheck,
    runCheckError,
    error,
    createAlertFromFields,
    toggleAlertEnabled,
    toggleAlertEmail,
    deleteAlert,
    setUpAlertAgain,
    runAlertCheck,
  } = usePriceAlerts()

  const {
    notifications,
    loading: historyLoading,
    error: historyError,
    markingRead,
    markRead,
  } = useAlertNotifications()

  return (
    <div className="flex flex-col gap-6">
      <AlertRunCheckToolbar
        running={runningCheck}
        error={runCheckError}
        onRunCheck={runAlertCheck}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <PriceAlertsPanel
          userEmail={userEmail}
          alerts={alerts}
          loading={loading}
          creating={creating}
          updating={updating}
          deleting={deleting}
          error={error}
          onCreate={createAlertFromFields}
          onToggleEnabled={toggleAlertEnabled}
          onToggleEmail={toggleAlertEmail}
          onDelete={deleteAlert}
          onSetUpAgain={setUpAlertAgain}
        />

        <AlertHistoryPanel
          notifications={notifications}
          loading={historyLoading}
          error={historyError}
          markingRead={markingRead}
          onMarkRead={markRead}
        />
      </div>
    </div>
  )
}

export default AlertsTab
