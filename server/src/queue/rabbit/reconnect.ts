import { establishConnection } from "./connect.js";
import {
  beginReconnect,
  canScheduleReconnect,
  clearConnectionState,
  endReconnect,
  getReconnectHandler,
  hasReconnectAttemptsRemaining,
  incrementReconnectAttempt,
  isShutdown,
  registerReconnectScheduler,
} from "./state.js";
import {
  MAX_RECONNECT_ATTEMPTS,
  printError,
  printLog,
  tryReconnect,
  waitBeforeReconnect,
} from "./utils.js";

type ReconnectStepResult =
  | { status: "success" }
  | { status: "stopped" }
  | { status: "retry"; reason: string };

/** Re-establishes the connection and runs the registered recovery handler. */
async function runReconnectHandler(): Promise<void> {
  await establishConnection();

  const handler = getReconnectHandler();
  if (handler) {
    await handler();
  }

  printLog("Reconnected successfully");
}

/** Runs one reconnect attempt: wait, connect, and recover consumers. */
async function performReconnectStep(reason: string): Promise<ReconnectStepResult> {
  const attempt = incrementReconnectAttempt();

  const shouldContinue = await waitBeforeReconnect(attempt, reason, isShutdown);
  if (!shouldContinue) {
    return { status: "stopped" };
  }

  const result = await tryReconnect(async () => {
    await runReconnectHandler();
  });

  if (result.ok) {
    return { status: "success" };
  }

  clearConnectionState();
  return { status: "retry", reason: result.reason };
}

/** Retries connection until success, shutdown, or max attempts. */
async function runReconnectLoop(initialReason: string): Promise<void> {
  let reason = initialReason;

  while (hasReconnectAttemptsRemaining(MAX_RECONNECT_ATTEMPTS)) {
    const step = await performReconnectStep(reason);

    if (step.status === "success" || step.status === "stopped") {
      return;
    }

    reason = step.reason;
  }

  printError("Max reconnect attempts reached, exiting worker");
  process.exit(1);
}

/** Reconnects to RabbitMQ and runs the registered consumer recovery handler. */
async function scheduleReconnect(reason: string): Promise<void> {
  if (!canScheduleReconnect()) {
    return;
  }

  beginReconnect();

  try {
    await runReconnectLoop(reason);
  } finally {
    endReconnect();
  }
}

/** Retries RabbitMQ connection after a transient startup failure. */
export async function retryRabbitConnection(reason: string): Promise<void> {
  await scheduleReconnect(reason);
}

registerReconnectScheduler(scheduleReconnect);
