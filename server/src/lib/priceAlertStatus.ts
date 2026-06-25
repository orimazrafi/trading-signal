type PriceAlertStatusFields = {
  enabled: boolean;
  lastTriggeredAt: Date | string | null;
};

/** Returns true when an alert is armed and eligible to fire. */
export function isActivePriceAlert(alert: PriceAlertStatusFields): boolean {
  return alert.enabled && alert.lastTriggeredAt === null;
}

/** Returns true when an alert has fired and can be set up again for the same symbol. */
export function canRearmPriceAlert(alert: PriceAlertStatusFields): boolean {
  return !isActivePriceAlert(alert);
}
