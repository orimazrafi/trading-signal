import type { AlertNotification } from '@/types/alert'

/** Returns how many alert notifications are still unread. */
export function countUnreadAlertNotifications(notifications: AlertNotification[]): number {
  return notifications.filter((notification) => notification.readAt === null).length
}
