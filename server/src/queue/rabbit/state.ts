import amqp, { type Channel } from "amqplib";

export type RabbitConnection = Awaited<ReturnType<typeof amqp.connect>>;
export type ReconnectHandler = () => Promise<void>;
type ReconnectScheduler = (reason: string) => Promise<void>;

let rabbitConnection: RabbitConnection | null = null;
let rabbitChannel: Channel | null = null;
let isShuttingDown = false;
let reconnectAttempt = 0;
let reconnectInProgress = false;
let reconnectHandler: ReconnectHandler | null = null;
let reconnectScheduler: ReconnectScheduler | null = null;

/** Registers the function invoked when the broker disconnects unexpectedly. */
export function registerReconnectScheduler(scheduler: ReconnectScheduler): void {
  reconnectScheduler = scheduler;
}

/** Schedules a reconnect after an unexpected broker disconnect. */
export function triggerReconnect(reason: string): void {
  void reconnectScheduler?.(reason);
}

/** Registers a callback that re-subscribes consumers after a reconnect. */
export function setRabbitReconnectHandler(handler: ReconnectHandler): void {
  reconnectHandler = handler;
}

/** Returns the registered consumer recovery handler, if any. */
export function getReconnectHandler(): ReconnectHandler | null {
  return reconnectHandler;
}

/** Returns the active RabbitMQ channel if connected. */
export function getRabbitChannel(): Channel | null {
  return rabbitChannel;
}

/** Stores the active connection and channel handles. */
export function setConnectionState(connection: RabbitConnection, channel: Channel): void {
  rabbitConnection = connection;
  rabbitChannel = channel;
  reconnectAttempt = 0;
}

/** Clears in-memory connection handles after the broker disconnects. */
export function clearConnectionState(): void {
  rabbitChannel = null;
  rabbitConnection = null;
}

/** Clears only the channel handle when the channel closes independently. */
export function clearChannel(): void {
  rabbitChannel = null;
}

/** Returns true while the worker is shutting down gracefully. */
export function isShutdown(): boolean {
  return isShuttingDown;
}

/** Returns the current reconnect attempt counter. */
export function getReconnectAttempt(): number {
  return reconnectAttempt;
}

/** Increments and returns the reconnect attempt counter. */
export function incrementReconnectAttempt(): number {
  reconnectAttempt += 1;
  return reconnectAttempt;
}

/** Returns false when reconnect should stop (shutdown or already in progress). */
export function canScheduleReconnect(): boolean {
  return !isShuttingDown && !reconnectInProgress;
}

/** Returns false when no reconnect attempts remain or shutdown started. */
export function hasReconnectAttemptsRemaining(maxAttempts: number): boolean {
  return !isShuttingDown && reconnectAttempt < maxAttempts;
}

/** Marks a reconnect cycle as in progress. */
export function beginReconnect(): void {
  reconnectInProgress = true;
}

/** Marks a reconnect cycle as finished. */
export function endReconnect(): void {
  reconnectInProgress = false;
}

/** Closes the RabbitMQ channel and connection during graceful shutdown. */
export async function closeRabbitConnection(): Promise<void> {
  isShuttingDown = true;

  const channel = rabbitChannel;
  const connection = rabbitConnection;
  rabbitChannel = null;
  rabbitConnection = null;

  try {
    await channel?.close();
  } catch {
    // Channel may already be closed by the broker.
  }

  try {
    await connection?.close();
  } catch {
    // Connection may already be closed by the broker.
  }
}
