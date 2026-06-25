import { z } from "zod";
import { safeParseApiResponse } from "./lib/zodApi.js";

/** Maximum active price alerts per user. */
export const MAX_ALERTS_PER_USER = 3;

/** Minimum allowed alert threshold percent. */
export const ALERT_MIN_THRESHOLD_PERCENT = 0.5;

/** Maximum allowed alert threshold percent. */
export const ALERT_MAX_THRESHOLD_PERCENT = 50;

export const priceAlertSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  thresholdPercent: z.number().finite(),
  baselinePrice: z.number().finite(),
  enabled: z.boolean(),
  emailEnabled: z.boolean(),
  lastTriggeredAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const alertNotificationSchema = z.object({
  id: z.string(),
  alertId: z.string(),
  symbol: z.string(),
  changePercent: z.number().finite(),
  price: z.number().finite(),
  baselinePrice: z.number().finite(),
  emailSent: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const alertNotificationEventSchema = z.object({
  id: z.string(),
  alertId: z.string(),
  symbol: z.string(),
  changePercent: z.number().finite(),
  price: z.number().finite(),
  baselinePrice: z.number().finite(),
  createdAt: z.string(),
});

export const alertNotificationPubSubPayloadSchema = alertNotificationEventSchema.extend({
  userId: z.string(),
});

export const priceAlertsResponseSchema = z.object({
  alerts: z.array(priceAlertSchema),
});

export const priceAlertResponseSchema = z.object({
  alert: priceAlertSchema,
});

export const alertNotificationsResponseSchema = z.object({
  notifications: z.array(alertNotificationSchema),
});

export const createPriceAlertInputSchema = z.object({
  symbol: z.string(),
  thresholdPercent: z.number().finite(),
  emailEnabled: z.boolean().optional(),
});

export const updatePriceAlertInputSchema = z.object({
  thresholdPercent: z.number().finite().optional(),
  enabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  resetBaseline: z.boolean().optional(),
});

/** User-configured price alert returned by the API. */
export type PriceAlert = z.infer<typeof priceAlertSchema>;

/** Triggered alert notification returned by the API. */
export type AlertNotification = z.infer<typeof alertNotificationSchema>;

/** Real-time alert notification event from SSE. */
export type AlertNotificationEvent = z.infer<typeof alertNotificationEventSchema>;

/** Redis pub/sub envelope: notification event plus target user id. */
export type AlertNotificationPubSubPayload = z.infer<typeof alertNotificationPubSubPayloadSchema>;

export type PriceAlertsResponse = z.infer<typeof priceAlertsResponseSchema>;

export type PriceAlertResponse = z.infer<typeof priceAlertResponseSchema>;

export type AlertNotificationsResponse = z.infer<typeof alertNotificationsResponseSchema>;

export type CreatePriceAlertInput = z.infer<typeof createPriceAlertInputSchema>;

export type UpdatePriceAlertInput = z.infer<typeof updatePriceAlertInputSchema>;

/** Validates a parsed JSON value as a price alerts list response. */
export function parsePriceAlertsResponse(value: unknown): PriceAlertsResponse | null {
  return safeParseApiResponse(priceAlertsResponseSchema, value);
}

/** Validates a parsed JSON value as a single price alert response. */
export function parsePriceAlertResponse(value: unknown): PriceAlertResponse | null {
  return safeParseApiResponse(priceAlertResponseSchema, value);
}

/** Validates a parsed JSON value as an alert notifications list response. */
export function parseAlertNotificationsResponse(value: unknown): AlertNotificationsResponse | null {
  return safeParseApiResponse(alertNotificationsResponseSchema, value);
}

/** Validates a parsed JSON value as an alert notification SSE event. */
export function parseAlertNotificationEvent(value: unknown): AlertNotificationEvent | null {
  return safeParseApiResponse(alertNotificationEventSchema, value);
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

  return safeParseApiResponse(alertNotificationPubSubPayloadSchema, parsed);
}
