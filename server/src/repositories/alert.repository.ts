import { prisma as prismaClient } from "../config/prisma.js";
import type { AlertNotification, PriceAlert } from "../types/alert.js";
import type {
  AlertNotificationRecord,
  AlertPrismaClient,
  PriceAlertRecord,
  PriceAlertUpdateFields,
} from "../types/alertDb.js";

const prisma = prismaClient as typeof prismaClient & AlertPrismaClient;

/** Maps a price alert row to an API-friendly payload. */
function mapPriceAlert(alert: PriceAlertRecord): PriceAlert {
  return {
    id: alert.id,
    symbol: alert.symbol,
    thresholdPercent: alert.thresholdPercent,
    baselinePrice: alert.baselinePrice,
    enabled: alert.enabled,
    emailEnabled: alert.emailEnabled,
    lastTriggeredAt: alert.lastTriggeredAt?.toISOString() ?? null,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
  };
}

/** Maps an alert notification row to an API-friendly payload. */
function mapAlertNotification(notification: AlertNotificationRecord): AlertNotification {
  return {
    id: notification.id,
    alertId: notification.alertId,
    symbol: notification.symbol,
    changePercent: notification.changePercent,
    price: notification.price,
    baselinePrice: notification.baselinePrice,
    emailSent: notification.emailSent,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

/** Counts active price alerts for a user. */
export async function countUserPriceAlerts(userId: string): Promise<number> {
  return prisma.priceAlert.count({ where: { userId, enabled: true } });
}

/** Lists price alerts for a user with pagination. */
export async function listUserPriceAlertsPaginated(
  userId: string,
  skip: number,
  take: number,
): Promise<{ alerts: PriceAlert[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
    prisma.priceAlert.count({ where: { userId } }),
  ]);

  return {
    alerts: rows.map(mapPriceAlert),
    total,
  };
}

/** Lists all price alerts for a user ordered by creation time. */
export async function listUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const { alerts } = await listUserPriceAlertsPaginated(userId, 0, Number.MAX_SAFE_INTEGER);
  return alerts;
}

/** Finds a price alert owned by the given user. */
export async function findUserPriceAlertById(
  userId: string,
  alertId: string,
): Promise<PriceAlertRecord | null> {
  return prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
  });
}

/** Finds a price alert by user and symbol. */
export async function findUserPriceAlertBySymbol(
  userId: string,
  symbol: string,
): Promise<PriceAlertRecord | null> {
  return prisma.priceAlert.findUnique({
    where: {
      userId_symbol: { userId, symbol },
    },
  });
}

/** Creates a new price alert for a user. */
export async function createUserPriceAlert(input: {
  userId: string;
  symbol: string;
  thresholdPercent: number;
  baselinePrice: number;
  emailEnabled: boolean;
}): Promise<PriceAlert> {
  const alert = await prisma.priceAlert.create({
    data: input,
  });

  return mapPriceAlert(alert);
}

/** Updates a user-owned price alert. */
export async function updateUserPriceAlert(
  alertId: string,
  data: PriceAlertUpdateFields,
): Promise<PriceAlert> {
  const alert = await prisma.priceAlert.update({
    where: { id: alertId },
    data,
  });

  return mapPriceAlert(alert);
}

/** Deletes a user-owned price alert. */
export async function deleteUserPriceAlert(alertId: string): Promise<void> {
  await prisma.priceAlert.delete({ where: { id: alertId } });
}

/** Lists alert notifications for a user, newest first. */
export async function listUserAlertNotificationsPaginated(
  userId: string,
  skip: number,
  take: number,
): Promise<{ notifications: AlertNotification[]; total: number }> {
  const [rows, total] = await Promise.all([
    prisma.alertNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.alertNotification.count({ where: { userId } }),
  ]);

  return {
    notifications: rows.map(mapAlertNotification),
    total,
  };
}

/** Lists alert notifications for a user, newest first. */
export async function listUserAlertNotifications(
  userId: string,
  limit = 50,
): Promise<AlertNotification[]> {
  const { notifications } = await listUserAlertNotificationsPaginated(userId, 0, limit);
  return notifications;
}

/** Marks a notification as read for the owning user. */
export async function markAlertNotificationRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const notification = await prisma.alertNotification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });

  return notification.count > 0;
}

/** Finds a user email address by id. */
export async function findUserEmailById(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return user?.email ?? null;
}
