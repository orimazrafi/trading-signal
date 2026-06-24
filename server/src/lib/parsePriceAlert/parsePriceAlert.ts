import type { CreatePriceAlertBody, UpdatePriceAlertBody } from "./types.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Parses POST /alerts body fields from the request. */
export function parseCreatePriceAlertBody(body: unknown): CreatePriceAlertBody {
  if (!isRecord(body)) {
    return { symbol: "", thresholdPercent: Number.NaN };
  }

  return {
    symbol: typeof body.symbol === "string" ? body.symbol : "",
    thresholdPercent:
      body.thresholdPercent === undefined ? Number.NaN : Number(body.thresholdPercent),
    emailEnabled: typeof body.emailEnabled === "boolean" ? body.emailEnabled : undefined,
  };
}

/** Parses PATCH /alerts/:id body fields from the request. */
export function parseUpdatePriceAlertBody(body: unknown): UpdatePriceAlertBody {
  if (!isRecord(body)) {
    return { resetBaseline: false };
  }

  return {
    thresholdPercent:
      body.thresholdPercent === undefined ? undefined : Number(body.thresholdPercent),
    enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    emailEnabled: typeof body.emailEnabled === "boolean" ? body.emailEnabled : undefined,
    resetBaseline: body.resetBaseline === true,
  };
}
