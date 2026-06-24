import { log, type LogMeta } from "../../lib/logger/index.js";
import {
  formatRabbitError,
  isFatalRabbitError,
  isTransientRabbitError,
} from "./errors.js";

export const MAX_RECONNECT_ATTEMPTS = 5;
export const INITIAL_RECONNECT_DELAY_MS = 1_000;
export const MAX_RECONNECT_DELAY_MS = 30_000;

export type ReconnectTryResult = { ok: true } | { ok: false; reason: string };

/** Logs a RabbitMQ warning with a consistent prefix. */
export function printWarning(message: string, meta?: LogMeta): void {
  log.warn(message, meta);
}

/** Logs a RabbitMQ error with a consistent prefix. */
export function printError(message: string, error?: unknown, meta?: LogMeta): void {
  log.error(message, error, meta);
}

/** Logs a RabbitMQ info message with a consistent prefix. */
export function printLog(message: string, meta?: LogMeta): void {
  log.info(message, meta);
}

/** Waits before the next reconnect attempt using exponential backoff. */
export function getReconnectDelayMs(attempt: number): number {
  return Math.min(INITIAL_RECONNECT_DELAY_MS * 2 ** (attempt - 1), MAX_RECONNECT_DELAY_MS);
}

/** Sleeps for the given duration. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Exits the worker when a fatal error occurs outside shutdown. */
export function exitIfFatal(error: unknown, context: string, isShuttingDown: boolean): void {
  if (isShuttingDown || !isFatalRabbitError(error)) {
    return;
  }

  printError(`Fatal ${context}, exiting worker`);
  process.exit(1);
}

/** Logs and waits before the next reconnect attempt; returns false if shutting down. */
export async function waitBeforeReconnect(
  attempt: number,
  reason: string,
  isShuttingDown: () => boolean,
): Promise<boolean> {
  const delayMs = getReconnectDelayMs(attempt);
  printWarning(`Reconnecting in ${delayMs}ms (attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}): ${reason}`, {
    attempt,
    maxAttempts: MAX_RECONNECT_ATTEMPTS,
    delayMs,
    reason,
  });

  await sleep(delayMs);
  return !isShuttingDown();
}

/** Logs a reconnect failure and returns the next retry reason, or exits on fatal errors. */
export function resolveReconnectFailure(error: unknown): string {
  printError("Reconnect attempt failed:", error);

  if (isFatalRabbitError(error)) {
    printError("Fatal reconnect error, exiting worker");
    process.exit(1);
  }

  if (!isTransientRabbitError(error)) {
    printError("Unclassified reconnect error, exiting worker");
    process.exit(1);
  }

  return formatRabbitError(error);
}

/** Attempts one reconnect cycle; returns ok or the reason to retry with. */
export async function tryReconnect(
  runHandler: () => Promise<void>,
): Promise<ReconnectTryResult> {
  try {
    await runHandler();
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: resolveReconnectFailure(error) };
  }
}
