import type { AlertNotification } from '@/types/alert'

export type AlertHistoryPanelProps = {
  notifications: AlertNotification[]
  loading: boolean
  error: string | null
  markingRead: boolean
  onMarkRead: (notificationId: string) => Promise<void>
}
