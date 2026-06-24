import type { AlertNotification } from '@/types/alert'

export type AlertHistoryCardProps = {
  notification: AlertNotification
  markingRead: boolean
  onMarkRead: (notificationId: string) => Promise<void>
}
