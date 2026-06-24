import {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
  MAX_ALERTS_PER_USER,
} from "../lib/alertConstants.js";
import {
  countUserPriceAlerts,
  createUserPriceAlert,
  deleteUserPriceAlert,
  findUserPriceAlertById,
  findUserPriceAlertBySymbol,
  listUserAlertNotifications,
  listUserPriceAlerts,
  markAlertNotificationRead,
  updateUserPriceAlert,
} from "../repositories/alert.repository.js";
import { getStockPrice } from "./stock.service.js";

export class AlertError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "AlertError";
  }
}

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/** Validates and normalizes an alert threshold percent. */
function normalizeThresholdPercent(thresholdPercent: number): number {
  if (!Number.isFinite(thresholdPercent)) {
    throw new AlertError("Threshold percent must be a number");
  }

  if (thresholdPercent < ALERT_MIN_THRESHOLD_PERCENT || thresholdPercent > ALERT_MAX_THRESHOLD_PERCENT) {
    throw new AlertError(
      `Threshold must be between ${ALERT_MIN_THRESHOLD_PERCENT}% and ${ALERT_MAX_THRESHOLD_PERCENT}%`,
    );
  }

  return Math.round(thresholdPercent * 100) / 100;
}

/** Returns all configured price alerts for a user. */
export async function getAlertsForUser(userId: string) {
  return listUserPriceAlerts(userId);
}

/** Creates a new price alert for a user. */
export async function createAlertForUser(
  userId: string,
  input: {
    symbol: string;
    thresholdPercent: number;
    emailEnabled?: boolean;
  },
) {
  const symbol = normalizeSymbol(input.symbol);

  if (!symbol) {
    throw new AlertError("Stock symbol is required");
  }

  const alertCount = await countUserPriceAlerts(userId);
  if (alertCount >= MAX_ALERTS_PER_USER) {
    throw new AlertError(`You can configure up to ${MAX_ALERTS_PER_USER} price alerts`, 409);
  }

  const existing = await findUserPriceAlertBySymbol(userId, symbol);
  if (existing) {
    throw new AlertError("An alert already exists for this symbol", 409);
  }

  const thresholdPercent = normalizeThresholdPercent(input.thresholdPercent);

  let baselinePrice: number;
  try {
    baselinePrice = await getStockPrice(symbol);
  } catch {
    throw new AlertError("Unable to fetch a live price for this symbol", 502);
  }

  return createUserPriceAlert({
    userId,
    symbol,
    thresholdPercent,
    baselinePrice,
    emailEnabled: input.emailEnabled ?? true,
  });
}

/** Updates a user-owned price alert. */
export async function updateAlertForUser(
  userId: string,
  alertId: string,
  input: {
    thresholdPercent?: number;
    enabled?: boolean;
    emailEnabled?: boolean;
    resetBaseline?: boolean;
  },
) {
  const alert = await findUserPriceAlertById(userId, alertId);
  if (!alert) {
    throw new AlertError("Price alert not found", 404);
  }

  const nextThreshold =
    input.thresholdPercent === undefined
      ? undefined
      : normalizeThresholdPercent(input.thresholdPercent);

  let baselinePrice = alert.baselinePrice;
  if (input.resetBaseline) {
    try {
      baselinePrice = await getStockPrice(alert.symbol);
    } catch {
      throw new AlertError("Unable to fetch a live price for this symbol", 502);
    }
  }

  return updateUserPriceAlert(alert.id, {
    thresholdPercent: nextThreshold,
    enabled: input.enabled,
    emailEnabled: input.emailEnabled,
    baselinePrice,
  });
}

/** Deletes a user-owned price alert. */
export async function deleteAlertForUser(userId: string, alertId: string): Promise<void> {
  const alert = await findUserPriceAlertById(userId, alertId);
  if (!alert) {
    throw new AlertError("Price alert not found", 404);
  }

  await deleteUserPriceAlert(alert.id);
}

/** Returns alert notification history for a user. */
export async function getAlertNotificationsForUser(userId: string) {
  return listUserAlertNotifications(userId);
}

/** Marks one alert notification as read. */
export async function markNotificationReadForUser(
  userId: string,
  notificationId: string,
): Promise<void> {
  const updated = await markAlertNotificationRead(userId, notificationId);
  if (!updated) {
    throw new AlertError("Notification not found", 404);
  }
}
