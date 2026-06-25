import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { sendAlertErrorResponse } from "../lib/alertHttpErrors.js";
import { getAuthenticatedUserId } from "../lib/controllerAuth.js";
import {
  parseCreatePriceAlertBody,
  parseUpdatePriceAlertBody,
} from "../lib/parsePriceAlert/index.js";
import {
  registerAlertStreamClient,
  startAlertStream,
} from "../lib/alertStreamRegistry/index.js";
import { isAlertRunnerDevTriggerEnabled, triggerAlertsRunnerCheck } from "../lib/alertsRunnerClient.js";
import {
  createAlertForUser,
  deleteAlertForUser,
  getAlertNotificationsForUser,
  getAlertsForUser,
  markNotificationReadForUser,
  updateAlertForUser,
} from "../services/alert.service.js";

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
    sendAlertErrorResponse(res, error, req.path);
  }
}

/** Creates a new price alert for the authenticated user. */
export async function postPriceAlert(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const { symbol, thresholdPercent, emailEnabled } = parseCreatePriceAlertBody(req.body);

  try {
    const alert = await createAlertForUser(userId, { symbol, thresholdPercent, emailEnabled });
    res.status(HTTP_STATUS.CREATED).json({ alert });
  } catch (error) {
    sendAlertErrorResponse(res, error, req.path);
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Alert id is required" });
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
    sendAlertErrorResponse(res, error, req.path);
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Alert id is required" });
    return;
  }

  try {
    await deleteAlertForUser(userId, alertId);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    sendAlertErrorResponse(res, error, req.path);
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
    sendAlertErrorResponse(res, error, req.path);
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Notification id is required" });
    return;
  }

  try {
    await markNotificationReadForUser(userId, notificationId);
    res.json({ ok: true });
  } catch (error) {
    sendAlertErrorResponse(res, error, req.path);
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

/** Triggers an immediate alert check via alerts-runner (development only). */
export async function postAlertRunCheck(req: Request, res: Response): Promise<void> {
  if (!getAuthenticatedUserId(req, res)) {
    return;
  }

  if (!isAlertRunnerDevTriggerEnabled()) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      error:
        "Alert check trigger is unavailable. Start alerts-runner with ALERT_RUNNER_DEV_HTTP=true and set ALERTS_RUNNER_URL.",
    });
    return;
  }

  try {
    await triggerAlertsRunnerCheck();
    res.json({ ok: true });
  } catch (error) {
    sendAlertErrorResponse(res, error, req.path);
  }
}
