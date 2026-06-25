import type { AlertNotification } from '@/types/alert'

export type AlertHistoryPanelProps = {
  notifications: AlertNotification[]
  loading: boolean
  error: string | null
  markingRead: boolean
  resettingNotificationId: string | null
  onMarkRead: (notificationId: string) => Promise<void>
  onResetAlert: (notification: AlertNotification) => Promise<void>
}
