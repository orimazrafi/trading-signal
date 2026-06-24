import type {
  AlertNotificationEvent,
  AlertNotificationPubSubPayload,
} from "../types/alert.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates a parsed JSON value as an alert notification SSE event. */
export function parseAlertNotificationEvent(value: unknown): AlertNotificationEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, alertId, symbol, changePercent, price, baselinePrice, createdAt } = value;

  if (
    typeof id !== "string" ||
    typeof alertId !== "string" ||
    typeof symbol !== "string" ||
    typeof changePercent !== "number" ||
    typeof price !== "number" ||
    typeof baselinePrice !== "number" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }

  return {
    id,
    alertId,
    symbol,
    changePercent,
    price,
    baselinePrice,
    createdAt,
  };
}

/** Parses a Redis pub/sub JSON string into an alert notification with user id. */
export function parseAlertNotificationPubSubPayload(
  payload: string,
): AlertNotificationPubSubPayload | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(payload);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || typeof parsed.userId !== "string") {
    return null;
  }

  const event = parseAlertNotificationEvent(parsed);
  if (!event) {
    return null;
  }

  return {
    userId: parsed.userId,
    ...event,
  };
}
