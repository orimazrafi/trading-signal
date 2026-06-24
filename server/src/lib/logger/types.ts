export type LogMeta = Record<string, unknown>;

export type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
  level: LogLevel;
  message: string;
  meta?: LogMeta;
  error?: unknown;
  at: Date;
};

export type LogSink = (entry: LogEntry) => void;

export type Logger = {
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, error?: unknown, meta?: LogMeta) => void;
};
