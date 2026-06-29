/**
 * Repeating worker task for price alert evaluation.
 *
 * Every N minutes (and once on startup during US market hours):
 *   1. Load enabled alerts
 *   2. Fetch live prices
 *   3. Trigger crossings, publish SSE events, and send emails
 */
import { env } from "../config/env.js";
import { log } from "../lib/logger/index.js";
import { evaluatePriceAlerts } from "../services/alert-evaluation.service.js";

/** Active interval handle, or null when the job is stopped. */
let pollInterval: ReturnType<typeof setInterval> | null = null;

/** Runs one alert evaluation pass and logs unexpected failures. */
async function pollAlerts(): Promise<void> {
  try {
    await evaluatePriceAlerts();
  } catch (error) {
    log.error("Alert evaluation failed", error);
  }
}

/** Starts the alert evaluation job if enabled and not already running. */
export function startAlertsJob(): void {
  if (!env.alertsEvaluationEnabled) {
    log.info("Alert evaluation is off (ALERTS_EVALUATION_ENABLED=false)");
    return;
  }

  if (pollInterval) {
    return;
  }

  log.info("Alert evaluation started", {
    intervalMinutes: env.alertCheckIntervalMs / 60_000,
  });

  void pollAlerts();
  pollInterval = setInterval(pollAlerts, env.alertCheckIntervalMs);
}

/** Stops the repeating alert evaluation job. */
export function stopAlertsJob(): void {
  if (!pollInterval) {
    return;
  }

  clearInterval(pollInterval);
  pollInterval = null;
}

/** Evaluates alerts immediately, bypassing market-hours checks (development manual trigger). */
export async function runAlertEvaluationOnce(): Promise<void> {
  await evaluatePriceAlerts({ ignoreMarketHours: true });
}
