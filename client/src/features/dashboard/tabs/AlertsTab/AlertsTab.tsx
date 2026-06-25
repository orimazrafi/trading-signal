import { useState } from 'react'
import { toast } from '@/components/Toast'
import type { AlertNotification } from '@/types/alert'
import { AlertHistoryPanel } from '@/features/alerts/components/AlertHistoryPanel'
import { AlertRunCheckToolbar } from '@/features/alerts/components/AlertRunCheckToolbar'
import { PriceAlertsPanel } from '@/features/alerts/components/PriceAlertsPanel'
import { useAlertNotifications } from '@/features/alerts/hooks/useAlertNotifications'
import { usePriceAlerts } from '@/features/alerts/hooks/usePriceAlerts'
import type { AlertsTabProps } from './types'

/** Alerts tab for configuring price alerts and reviewing history. */
function AlertsTab({ userEmail }: AlertsTabProps) {
  const [resettingNotificationId, setResettingNotificationId] = useState<string | null>(null)

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
    reload: reloadAlerts,
  } = usePriceAlerts()

  const {
    notifications,
    loading: historyLoading,
    error: historyError,
    markingRead,
    markRead,
    reload: reloadHistory,
  } = useAlertNotifications()

  /** Re-arms the alert tied to a history notification. */
  const handleResetAlert = async (notification: AlertNotification) => {
    const alert = alerts.find((item) => item.id === notification.alertId)

    if (!alert) {
      toast.error('This alert was removed. Create a new one from Price alerts.')
      return
    }

    setResettingNotificationId(notification.id)

    try {
      await setUpAlertAgain(alert)
      toast.success(`${notification.symbol} alert reset with a fresh baseline.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to reset alert.')
    } finally {
      setResettingNotificationId(null)
    }
  }

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
          onRetry={() => void reloadAlerts()}
        />

        <AlertHistoryPanel
          notifications={notifications}
          loading={historyLoading}
          error={historyError}
          markingRead={markingRead}
          resettingNotificationId={resettingNotificationId}
          onMarkRead={markRead}
          onResetAlert={handleResetAlert}
          onRetry={() => void reloadHistory()}
        />
      </div>
    </div>
  )
}

export default AlertsTab
