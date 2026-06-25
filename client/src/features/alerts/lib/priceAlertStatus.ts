import type { PriceAlert } from '@/types/alert'

/** Returns true when an alert is armed and eligible to fire. */
export function isActivePriceAlert(alert: Pick<PriceAlert, 'enabled' | 'lastTriggeredAt'>): boolean {
  return alert.enabled && alert.lastTriggeredAt === null
}

/** Returns true when an alert has fired and can be set up again for the same symbol. */
export function canRearmPriceAlert(alert: Pick<PriceAlert, 'enabled' | 'lastTriggeredAt'>): boolean {
  return !isActivePriceAlert(alert)
}
