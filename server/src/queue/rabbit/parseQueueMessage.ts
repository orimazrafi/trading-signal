import type { ConsumeMessage } from "amqplib";
import { log } from "../../lib/logger/index.js";

/** Parses a RabbitMQ message body as JSON, or null when parsing fails. */
export function parseQueueMessage<T>(message: ConsumeMessage): T | null {
  try {
    const stringContent = message.content.toString("utf-8");
    return JSON.parse(stringContent) as T;
  } catch (error) {
    log.error("Failed to parse message payload", error);
    return null;
  }
}
