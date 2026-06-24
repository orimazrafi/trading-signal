import type { Request, Response } from "express";
import { log } from "../lib/logger.js";
import {
  registerAlertStreamClient,
  startAlertStream,
} from "../lib/alertStreamRegistry.js";
import {
  AlertError,
  createAlertForUser,
  deleteAlertForUser,
  getAlertNotificationsForUser,
  getAlertsForUser,
  markNotificationReadForUser,
  updateAlertForUser,
} from "../services/alert.service.js";

/** Returns the authenticated user id or sends 401. */
function getAuthenticatedUserId(req: Request, res: Response): string | null {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return userId;
}

/** Parses PATCH /alerts/:id body fields from the request. */
function parseUpdatePriceAlertBody(body: unknown): {
  thresholdPercent?: number;
  enabled?: boolean;
  emailEnabled?: boolean;
  resetBaseline: boolean;
} {
  const payload =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  return {
    thresholdPercent:
      payload.thresholdPercent === undefined ? undefined : Number(payload.thresholdPercent),
    enabled: typeof payload.enabled === "boolean" ? payload.enabled : undefined,
    emailEnabled: typeof payload.emailEnabled === "boolean" ? payload.emailEnabled : undefined,
    resetBaseline: payload.resetBaseline === true,
  };
}

/** Maps alert service errors to HTTP responses. */
function handleAlertError(res: Response, error: unknown, path: string): void {
  if (error instanceof AlertError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(500).json({ error: "Alert request failed" });
}

/** Returns all configured price alerts for the authenticated user. */
export async function getPriceAlerts(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const alerts = await getAlertsForUser(userId);
    res.json({ alerts });
  } catch (error) {
    handleAlertError(res, error, req.path);
  }
}

/** Creates a new price alert for the authenticated user. */
export async function postPriceAlert(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const symbol = typeof req.body?.symbol === "string" ? req.body.symbol : "";
  const thresholdPercent = Number(req.body?.thresholdPercent);
  const emailEnabled =
    typeof req.body?.emailEnabled === "boolean" ? req.body.emailEnabled : undefined;

  try {
    const alert = await createAlertForUser(userId, { symbol, thresholdPercent, emailEnabled });
    res.status(201).json({ alert });
  } catch (error) {
    handleAlertError(res, error, req.path);
  }
}

/** Updates a price alert owned by the authenticated user. */
export async function patchPriceAlert(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const alertId = req.params.id?.trim() ?? "";
  const { thresholdPercent, enabled, emailEnabled, resetBaseline } = parseUpdatePriceAlertBody(
    req.body,
  );

  if (!alertId) {
    res.status(400).json({ error: "Alert id is required" });
    return;
  }

  try {
    const alert = await updateAlertForUser(userId, alertId, {
      thresholdPercent,
      enabled,
      emailEnabled,
      resetBaseline,
    });
    res.json({ alert });
  } catch (error) {
    handleAlertError(res, error, req.path);
  }
}

/** Deletes a price alert owned by the authenticated user. */
export async function deletePriceAlert(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const alertId = req.params.id?.trim() ?? "";
  if (!alertId) {
    res.status(400).json({ error: "Alert id is required" });
    return;
  }

  try {
    await deleteAlertForUser(userId, alertId);
    res.status(204).send();
  } catch (error) {
    handleAlertError(res, error, req.path);
  }
}

/** Returns alert notification history for the authenticated user. */
export async function getAlertNotifications(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const notifications = await getAlertNotificationsForUser(userId);
    res.json({ notifications });
  } catch (error) {
    handleAlertError(res, error, req.path);
  }
}

/** Marks one alert notification as read. */
export async function patchAlertNotificationRead(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const notificationId = req.params.id?.trim() ?? "";
  if (!notificationId) {
    res.status(400).json({ error: "Notification id is required" });
    return;
  }

  try {
    await markNotificationReadForUser(userId, notificationId);
    res.json({ ok: true });
  } catch (error) {
    handleAlertError(res, error, req.path);
  }
}

/** Opens an SSE stream for real-time alert notifications. */
export function getAlertStream(req: Request, res: Response): void {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  startAlertStream(res);
  registerAlertStreamClient(userId, res);
}
