import {
  alertNotificationsResponseSchema,
  priceAlertResponseSchema,
  priceAlertsResponseSchema,
} from '@trading-signal/contracts/alert'
import type {
  CreatePriceAlertInput,
  PriceAlert,
  UpdatePriceAlertInput,
} from '@/types/alert'
import type { ApiRequestOptions } from './types'
import { api } from './client'
import { fetchValidated, patchValidated, postValidated } from './fetchValidated'

/** Fetches configured price alerts for the authenticated user. */
export async function fetchPriceAlerts(options: ApiRequestOptions = {}): Promise<PriceAlert[]> {
  const data = await fetchValidated(
    '/alerts',
    priceAlertsResponseSchema,
    'price alerts',
    { signal: options.signal },
  )

  return data.alerts
}

/** Creates a new price alert. */
export async function createPriceAlert(input: CreatePriceAlertInput): Promise<PriceAlert> {
  const data = await postValidated(
    '/alerts',
    priceAlertResponseSchema,
    'price alert',
    input,
  )

  return data.alert
}

/** Updates an existing price alert. */
export async function updatePriceAlert(
  alertId: string,
  input: UpdatePriceAlertInput,
): Promise<PriceAlert> {
  const data = await patchValidated(
    `/alerts/${alertId}`,
    priceAlertResponseSchema,
    'price alert',
    input,
  )

  return data.alert
}

/** Deletes a price alert. */
export async function deletePriceAlert(alertId: string): Promise<void> {
  await api.delete(`/alerts/${alertId}`)
}

/** Fetches alert notification history. */
export async function fetchAlertNotifications(options: ApiRequestOptions = {}) {
  const data = await fetchValidated(
    '/alerts/notifications',
    alertNotificationsResponseSchema,
    'alert notifications',
    { signal: options.signal },
  )

  return data.notifications
}

/** Marks one alert notification as read. */
export async function markAlertNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/alerts/notifications/${notificationId}/read`)
}

/** Triggers an immediate check of all enabled alerts (development only). */
export async function triggerAlertCheck(): Promise<void> {
  await api.post('/alerts/run-check', {}, { timeout: 60_000 })
}

/** Opens an SSE stream URL for real-time alert notifications. */
export function getAlertStreamUrl(): string {
  return '/api/alerts/stream'
}
