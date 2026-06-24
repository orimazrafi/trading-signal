import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { ALERT_REDIS_CHANNEL } from "../lib/alertConstants.js";
import { pushAlertNotificationToUser } from "../lib/alertStreamRegistry.js";
import { log } from "../lib/logger.js";
import { parseAlertNotificationPubSubPayload } from "./parseAlertNotification.js";

let subscriber: Redis | null = null;

/** Subscribes to Redis alert notifications and forwards them to SSE clients. */
export async function startAlertNotificationSubscriber(): Promise<void> {
  if (subscriber) {
    return;
  }

  subscriber = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  subscriber.on("error", (error: Error) => {
    log.error("Alert notification subscriber error", error);
  });

  await subscriber.subscribe(ALERT_REDIS_CHANNEL);

  subscriber.on("message", (channel: string, message: string) => {
    if (channel !== ALERT_REDIS_CHANNEL) {
      return;
    }

    const event = parseAlertNotificationPubSubPayload(message);
    if (!event) {
      log.error("Invalid alert notification pub/sub payload", new Error("parse failed"));
      return;
    }

    const { userId, ...notification } = event;
    pushAlertNotificationToUser(userId, notification);
  });

  log.info("Subscribed to alert notification channel", { channel: ALERT_REDIS_CHANNEL });
}
