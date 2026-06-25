import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import {
  assertNoActiveAlertForSymbol,
  parseCreateAlertFields,
  type ValidatedCreateAlertFields,
} from "../lib/alertCreateRules.js";
import { AlertError } from "../lib/alertError.js";
import { normalizeAlertThresholdPercent } from "../lib/alertInput.js";
import {
  assertUserHasActiveAlertSlot,
  fetchAlertBaselinePrice,
} from "./alertCreateSupport.js";
import {
  createUserPriceAlert,
  deleteUserPriceAlert,
  findUserPriceAlertById,
  findUserPriceAlertBySymbol,
  listUserAlertNotifications,
  listUserPriceAlerts,
  markAlertNotificationRead,
  updateUserPriceAlert,
} from "../repositories/alert.repository.js";
import type { PriceAlertRecord } from "../types/alertDb.js";
import type { PriceAlert } from "../types/alert.js";

export { AlertError } from "../lib/alertError.js";

/** Returns all configured price alerts for a user. */
export async function getAlertsForUser(userId: string) {
  return listUserPriceAlerts(userId);
}

/** Creates a new price alert for a user, or re-arms a previously triggered one for the same symbol. */
export async function createAlertForUser(
  userId: string,
  input: {
    symbol: string;
    thresholdPercent: number;
    emailEnabled?: boolean;
    baselinePrice?: number;
  },
): Promise<PriceAlert> {
  const fields = parseCreateAlertFields(input);
  const baselinePrice =
    fields.baselinePrice ?? (await fetchAlertBaselinePrice(fields.symbol));
  const existing = await findUserPriceAlertBySymbol(userId, fields.symbol);

  if (existing) {
    return rearmAlertForUser(existing, fields, baselinePrice);
  }

  await assertUserHasActiveAlertSlot(userId);
  return createUserPriceAlert({
    userId,
    symbol: fields.symbol,
    thresholdPercent: fields.thresholdPercent,
    baselinePrice,
    emailEnabled: fields.emailEnabled,
  });
}

/** Re-enables a previously triggered alert for the same symbol. */
async function rearmAlertForUser(
  existing: PriceAlertRecord,
  fields: ValidatedCreateAlertFields,
  baselinePrice: number,
): Promise<PriceAlert> {
  assertNoActiveAlertForSymbol(existing);
  await assertUserHasActiveAlertSlot(existing.userId, { hintRemoveExisting: true });

  return updateUserPriceAlert(existing.id, {
    thresholdPercent: fields.thresholdPercent,
    baselinePrice,
    enabled: true,
    emailEnabled: fields.emailEnabled,
    lastTriggeredAt: null,
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
    throw new AlertError("Price alert not found", HTTP_STATUS.NOT_FOUND);
  }

  const nextThreshold =
    input.thresholdPercent === undefined
      ? undefined
      : normalizeAlertThresholdPercent(input.thresholdPercent);

  const baselinePrice = input.resetBaseline
    ? await fetchAlertBaselinePrice(alert.symbol)
    : alert.baselinePrice;

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
    throw new AlertError("Price alert not found", HTTP_STATUS.NOT_FOUND);
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
    throw new AlertError("Notification not found", HTTP_STATUS.NOT_FOUND);
  }
}
