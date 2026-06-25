import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { MAX_ALERTS_PER_USER } from "./alertConstants.js";
import { AlertError } from "./alertError.js";
import { normalizeAlertSymbol, normalizeAlertThresholdPercent } from "./alertInput.js";
import { isActivePriceAlert } from "./priceAlertStatus.js";
import type { PriceAlertRecord } from "../types/alertDb.js";

export type CreateAlertServiceInput = {
  symbol: string;
  thresholdPercent: number;
  emailEnabled?: boolean;
};

export type ValidatedCreateAlertFields = {
  symbol: string;
  thresholdPercent: number;
  emailEnabled: boolean;
};

/** Validates create-alert input into normalized service fields. */
export function parseCreateAlertFields(input: CreateAlertServiceInput): ValidatedCreateAlertFields {
  const symbol = normalizeAlertSymbol(input.symbol);

  if (!symbol) {
    throw new AlertError("Stock symbol is required");
  }

  return {
    symbol,
    thresholdPercent: normalizeAlertThresholdPercent(input.thresholdPercent),
    emailEnabled: input.emailEnabled ?? true,
  };
}

/** Throws when an active alert already exists for the symbol. */
export function assertNoActiveAlertForSymbol(existing: PriceAlertRecord): void {
  if (isActivePriceAlert(existing)) {
    throw new AlertError("An alert already exists for this symbol", HTTP_STATUS.CONFLICT);
  }
}

type MaxAlertsMessageOptions = {
  hintRemoveExisting?: boolean;
};

/** Builds the error message when a user has reached the active alert limit. */
export function buildMaxActiveAlertsMessage(options: MaxAlertsMessageOptions = {}): string {
  const baseMessage = `You can configure up to ${MAX_ALERTS_PER_USER} price alerts`;

  return options.hintRemoveExisting ? `${baseMessage}. Remove or disable one first.` : baseMessage;
}
