import { redis } from "../config/redis.js";
import type { AlertNotificationPubSubPayload } from "./parseAlertNotification.js";
import { ALERT_REDIS_CHANNEL } from "./alertConstants.js";

/** Publishes a triggered alert notification to Redis for SSE delivery. */
export async function publishAlertNotification(
  event: AlertNotificationPubSubPayload,
): Promise<void> {
  await redis.publish(ALERT_REDIS_CHANNEL, JSON.stringify(event));
}
