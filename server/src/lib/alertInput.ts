import {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
} from "./alertConstants.js";
import { AlertError } from "./alertError.js";

/** Normalizes a ticker symbol to uppercase. */
export function normalizeAlertSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/** Validates and normalizes an alert threshold percent. */
export function normalizeAlertThresholdPercent(thresholdPercent: number): number {
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
