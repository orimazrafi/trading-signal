import type { StockHistoryPoint } from "../../../types/stockHistory.js";
import type { FinnhubCandleResponse } from "./types.js";

/** Returns true when all OHLC values are valid numbers. */
function hasValidOhlc(open: number, high: number, low: number, close: number): boolean {
  return [open, high, low, close].every((value) => !Number.isNaN(value));
}

/** Formats a candle timestamp for intraday or daily charts. */
function formatCandleTime(timestamp: number, isIntraday: boolean): string | number {
  if (isIntraday) {
    return timestamp;
  }

  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

/** Maps one Finnhub candle index to an OHLCV point, or null when data is invalid. */
function mapCandleAtIndex(
  data: FinnhubCandleResponse,
  index: number,
  isIntraday: boolean,
): StockHistoryPoint | null {
  const timestamp = data.t?.[index];
  if (timestamp === undefined) {
    return null;
  }

  const open = Number(data.o?.[index]);
  const high = Number(data.h?.[index]);
  const low = Number(data.l?.[index]);
  const close = Number(data.c?.[index]);
  const volume = Number(data.v?.[index] ?? 0);

  if (!hasValidOhlc(open, high, low, close)) {
    return null;
  }

  return {
    time: formatCandleTime(timestamp, isIntraday),
    open,
    high,
    low,
    close,
    volume: Number.isNaN(volume) ? 0 : volume,
  };
}

/** Maps Finnhub candle arrays to internal OHLCV points. */
export function mapFinnhubCandles(
  data: FinnhubCandleResponse,
  isIntraday: boolean,
): StockHistoryPoint[] {
  const length = data.t?.length ?? 0;

  return Array.from({ length }, (_, index) => mapCandleAtIndex(data, index, isIntraday)).filter(
    (point): point is StockHistoryPoint => point !== null,
  );
}
