import type { Channel } from "amqplib";
import {
  clearChannel,
  clearConnectionState,
  isShutdown,
  triggerReconnect,
  type RabbitConnection,
} from "./state.js";
import { exitIfFatal, printError, printLog, printWarning } from "./utils.js";

/** Handles unexpected connection errors from the broker. */
function onConnectionError(error: unknown): void {
  printError("Connection error:", error);
  exitIfFatal(error, "connection error", isShutdown());
}

/** Handles broker-initiated connection closure. */
function onConnectionClose(): void {
  if (isShutdown()) {
    printLog("Connection closed during shutdown");
    return;
  }

  printWarning("Connection closed unexpectedly");
  clearConnectionState();
  triggerReconnect("connection closed");
}

/** Handles unexpected channel errors from the broker. */
function onChannelError(error: unknown): void {
  printError("Channel error:", error);
  exitIfFatal(error, "channel error", isShutdown());
}

/** Handles broker-initiated channel closure. */
function onChannelClose(): void {
  if (isShutdown()) {
    return;
  }

  printWarning("Channel closed unexpectedly");
  clearChannel();
  triggerReconnect("channel closed");
}

/** Attaches lifecycle handlers to the RabbitMQ connection and channel. */
export function attachConnectionHandlers(
  connection: RabbitConnection,
  channel: Channel,
): void {
  connection.on("error", onConnectionError);
  connection.on("close", onConnectionClose);
  channel.on("error", onChannelError);
  channel.on("close", onChannelClose);
}
