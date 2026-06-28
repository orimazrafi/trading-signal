import {
  alertNotificationsResponseSchema,
  priceAlertResponseSchema,
  priceAlertsResponseSchema,
} from '@trading-signal/contracts/alert'
import { buildApiPath } from '@trading-signal/contracts/apiPath'
import type {
  CreatePriceAlertInput,
  PriceAlert,
  UpdatePriceAlertInput,
} from '@/types/alert'
import type { ApiRequestOptions } from './types'
import { api } from './client'
import { fetchValidated, patchValidated, postValidated } from './fetchValidated'

const DEFAULT_LIST_PAGE = 1
const DEFAULT_LIST_LIMIT = 20

/** Fetches configured price alerts for the authenticated user. */
export async function fetchPriceAlerts(
  options: ApiRequestOptions & { page?: number; limit?: number } = {},
): Promise<PriceAlert[]> {
  const { page = DEFAULT_LIST_PAGE, limit = DEFAULT_LIST_LIMIT, signal } = options

  const data = await fetchValidated(
    '/price-alerts',
    priceAlertsResponseSchema,
    'price alerts',
    {
      signal,
      params: { page, limit },
    },
  )

  return data.alerts
}

/** Creates a new price alert. */
export async function createPriceAlert(input: CreatePriceAlertInput): Promise<PriceAlert> {
  const data = await postValidated(
    '/price-alerts',
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
    `/price-alerts/${alertId}`,
    priceAlertResponseSchema,
    'price alert',
    input,
  )

  return data.alert
}

/** Deletes a price alert. */
export async function deletePriceAlert(alertId: string): Promise<void> {
  await api.delete(`/price-alerts/${alertId}`)
}

/** Fetches alert notification history. */
export async function fetchAlertNotifications(
  options: ApiRequestOptions & { page?: number; limit?: number } = {},
) {
  const { page = DEFAULT_LIST_PAGE, limit = DEFAULT_LIST_LIMIT, signal } = options

  const data = await fetchValidated(
    '/price-alerts/notifications',
    alertNotificationsResponseSchema,
    'alert notifications',
    {
      signal,
      params: { page, limit },
    },
  )

  return data.notifications
}

/** Marks one alert notification as read. */
export async function markAlertNotificationRead(notificationId: string): Promise<void> {
  await api.patch(`/price-alerts/notifications/${notificationId}/read`)
}

/** Triggers an immediate check of all enabled alerts (development only). */
export async function triggerAlertCheck(): Promise<void> {
  await api.post('/price-alerts/run-check', {}, { timeout: 60_000 })
}

/** Opens an SSE stream URL for real-time alert notifications. */
export function getAlertStreamUrl(): string {
  return buildApiPath('/price-alerts/stream')
}
