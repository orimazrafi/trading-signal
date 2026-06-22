import type { StockHistory, StockHistoryPoint } from "../types/stockHistory.js";
import { isStockHistoryRange } from "../types/stockHistory.js";

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates one OHLCV history point from cached JSON. */
function parseStockHistoryPoint(value: unknown): StockHistoryPoint | null {
  if (!isRecord(value)) {
    return null;
  }

  const { time, open, high, low, close, volume } = value;

  if (
    typeof time !== "string" ||
    typeof open !== "number" ||
    typeof high !== "number" ||
    typeof low !== "number" ||
    typeof close !== "number" ||
    typeof volume !== "number"
  ) {
    return null;
  }

  return { time, open, high, low, close, volume };
}

/** Validates a cached stock history payload from Redis. */
export function parseStockHistory(value: unknown): StockHistory | null {
  if (!isRecord(value)) {
    return null;
  }

  const { symbol, interval, range, points } = value;

  if (typeof symbol !== "string" || typeof interval !== "string" || typeof range !== "string") {
    return null;
  }

  if (!isStockHistoryRange(range)) {
    return null;
  }

  if (!Array.isArray(points)) {
    return null;
  }

  const parsedPoints = points
    .map((point) => parseStockHistoryPoint(point))
    .filter((point): point is StockHistoryPoint => point !== null);

  if (parsedPoints.length === 0) {
    return null;
  }

  return {
    symbol,
    interval,
    range,
    points: parsedPoints,
  };
}
