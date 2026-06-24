import type { Response } from "express";
import { log } from "../logger/index.js";
import type { AlertNotificationEvent } from "../../types/alert.js";
import type { AlertStreamClient } from "./types.js";

const clients = new Set<AlertStreamClient>();

/** Registers an SSE response for a user. */
export function registerAlertStreamClient(userId: string, response: Response): void {
  const client: AlertStreamClient = { userId, response };
  clients.add(client);

  response.on("close", () => {
    clients.delete(client);
  });
}

/** Writes the SSE headers and an initial connected event. */
export function startAlertStream(response: Response): void {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();
  response.write("event: connected\ndata: {}\n\n");
}

/** Pushes a notification event to all open streams for the user. */
export function pushAlertNotificationToUser(
  userId: string,
  notification: AlertNotificationEvent,
): void {
  const payload = `event: alert\ndata: ${JSON.stringify(notification)}\n\n`;

  for (const client of clients) {
    if (client.userId !== userId) {
      continue;
    }

    try {
      client.response.write(payload);
    } catch (error) {
      log.error("Failed to write alert SSE payload", error, { userId });
      clients.delete(client);
    }
  }
}

/** Returns the number of active SSE clients (for diagnostics). */
export function getActiveAlertStreamCount(): number {
  return clients.size;
}
