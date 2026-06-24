import { api } from './client'
import type {
  AlertNotificationsResponse,
  CreatePriceAlertInput,
  PriceAlertResponse,
  PriceAlertsResponse,
  UpdatePriceAlertInput,
} from '@/types/alert'

/** Fetches configured price alerts for the authenticated user. */
export async function fetchPriceAlerts() {
  const { data } = await api.get<PriceAlertsResponse>('/alerts')
  return data.alerts
}

/** Creates a new price alert. */
export async function createPriceAlert(input: CreatePriceAlertInput) {
  const { data } = await api.post<PriceAlertResponse>('/alerts', input)
  return data.alert
}

/** Updates an existing price alert. */
export async function updatePriceAlert(alertId: string, input: UpdatePriceAlertInput) {
  const { data } = await api.patch<PriceAlertResponse>(`/alerts/${alertId}`, input)
  return data.alert
}

/** Deletes a price alert. */
export async function deletePriceAlert(alertId: string): Promise<void> {
  await api.delete(`/alerts/${alertId}`)
}

/** Fetches alert notification history. */
export async function fetchAlertNotifications() {
  const { data } = await api.get<AlertNotificationsResponse>('/alerts/notifications')
  return data.notifications
}

/** Marks one alert notification as read. */
export async function markAlertNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/alerts/notifications/${notificationId}/read`)
}

/** Opens an SSE stream URL for real-time alert notifications. */
export function getAlertStreamUrl(): string {
  return '/api/alerts/stream'
}
