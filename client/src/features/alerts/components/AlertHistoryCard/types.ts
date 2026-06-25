import type { AlertNotification } from '@/types/alert'

export type AlertHistoryCardProps = {
  notification: AlertNotification
  markingRead: boolean
  resetting: boolean
  onMarkRead: (notificationId: string) => Promise<void>
  onResetAlert?: (notification: AlertNotification) => Promise<void>
}
