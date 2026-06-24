/** Maximum active price alerts per user. */
export const MAX_PRICE_ALERTS = 3

/** Minimum allowed alert threshold percent. */
export const ALERT_MIN_THRESHOLD_PERCENT = 0.5

/** Maximum allowed alert threshold percent. */
export const ALERT_MAX_THRESHOLD_PERCENT = 50

/** User-configured price alert. */
export type PriceAlert = {
  id: string
  symbol: string
  thresholdPercent: number
  baselinePrice: number
  enabled: boolean
  emailEnabled: boolean
  lastTriggeredAt: string | null
  createdAt: string
  updatedAt: string
}

/** Triggered alert notification. */
export type AlertNotification = {
  id: string
  alertId: string
  symbol: string
  changePercent: number
  price: number
  baselinePrice: number
  emailSent: boolean
  readAt: string | null
  createdAt: string
}

/** Real-time alert notification event from SSE. */
export type AlertNotificationEvent = {
  id: string
  alertId: string
  symbol: string
  changePercent: number
  price: number
  baselinePrice: number
  createdAt: string
}

export type PriceAlertsResponse = {
  alerts: PriceAlert[]
}

export type PriceAlertResponse = {
  alert: PriceAlert
}

export type AlertNotificationsResponse = {
  notifications: AlertNotification[]
}

export type CreatePriceAlertInput = {
  symbol: string
  thresholdPercent: number
  emailEnabled?: boolean
}

export type UpdatePriceAlertInput = {
  thresholdPercent?: number
  enabled?: boolean
  emailEnabled?: boolean
  resetBaseline?: boolean
}
