import type { LogEntry, LogLevel, LogMeta, Logger, LogSink } from "./types.js";

let sink: LogSink = defaultSink;
const beforeHooks: Array<(entry: LogEntry) => void> = [];
const afterHooks: Array<(entry: LogEntry) => void> = [];

/** Writes a structured log record to the native console. */
function defaultSink(entry: LogEntry): void {
  const label = `[${entry.level.toUpperCase()}]`;
  const details: LogMeta = { ...entry.meta };

  if (entry.error !== undefined) {
    details.error = entry.error;
  }

  if (Object.keys(details).length > 0) {
    const output = entry.level === "error" ? console.error : entry.level === "warn" ? console.warn : console.log;
    output(label, entry.message, details);
    return;
  }

  const output = entry.level === "error" ? console.error : entry.level === "warn" ? console.warn : console.log;
  output(label, entry.message);
}

/** Emits one log record through hooks and the active sink. */
function emit(level: LogLevel, message: string, error?: unknown, meta?: LogMeta): void {
  const entry: LogEntry = { level, message, meta, error, at: new Date() };

  for (const hook of beforeHooks) {
    hook(entry);
  }

  sink(entry);

  for (const hook of afterHooks) {
    hook(entry);
  }
}

/** Application-wide logger for all backend layers. */
export const log: Logger = {
  info: (message, meta) => emit("info", message, undefined, meta),
  warn: (message, meta) => emit("warn", message, undefined, meta),
  error: (message, error, meta) => emit("error", message, error, meta),
};

/** Replaces where log records are sent (e.g. external logging service). */
export function setLogSink(nextSink: LogSink): void {
  sink = nextSink;
}

/** Registers a hook that runs before each log record is emitted. */
export function addBeforeLogHook(hook: (entry: LogEntry) => void): void {
  beforeHooks.push(hook);
}

/** Registers a hook that runs after each log record is emitted. */
export function addAfterLogHook(hook: (entry: LogEntry) => void): void {
  afterHooks.push(hook);
}
