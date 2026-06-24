export {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
  MAX_ALERTS_PER_USER,
} from '@trading-signal/contracts/alert'

/** @deprecated Use MAX_ALERTS_PER_USER from contracts. */
export { MAX_ALERTS_PER_USER as MAX_PRICE_ALERTS } from '@trading-signal/contracts/alert'

export type {
  AlertNotification,
  AlertNotificationEvent,
  AlertNotificationsResponse,
  CreatePriceAlertInput,
  PriceAlert,
  PriceAlertResponse,
  PriceAlertsResponse,
  UpdatePriceAlertInput,
} from '@trading-signal/contracts/alert'
