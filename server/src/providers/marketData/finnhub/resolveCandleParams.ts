import type { StockHistoryRange } from "../../../types/stockHistory.js";
import { resolveYearToDateFromSeconds } from "../../../lib/yearToDateRange.js";

type FinnhubCandleParams = {
  resolution: string;
  from: number;
  to: number;
  interval: string;
  isIntraday: boolean;
};

const SECONDS_PER_DAY = 86_400;

/** Maps a dashboard chart range to Finnhub candle query parameters. */
export function resolveFinnhubCandleParams(range: StockHistoryRange): FinnhubCandleParams {
  const to = Math.floor(Date.now() / 1000);

  switch (range) {
    case "1D":
      return {
        resolution: "30",
        from: to - SECONDS_PER_DAY,
        to,
        interval: "30min",
        isIntraday: true,
      };
    case "1W":
      return {
        resolution: "D",
        from: to - 7 * SECONDS_PER_DAY,
        to,
        interval: "1day",
        isIntraday: false,
      };
    case "1M":
      return {
        resolution: "D",
        from: to - 30 * SECONDS_PER_DAY,
        to,
        interval: "1day",
        isIntraday: false,
      };
    case "3M":
      return {
        resolution: "D",
        from: to - 90 * SECONDS_PER_DAY,
        to,
        interval: "1day",
        isIntraday: false,
      };
    case "6M":
      return {
        resolution: "D",
        from: to - 180 * SECONDS_PER_DAY,
        to,
        interval: "1day",
        isIntraday: false,
      };
    case "YTD":
      return {
        resolution: "D",
        from: resolveYearToDateFromSeconds(),
        to,
        interval: "1day",
        isIntraday: false,
      };
    case "1Y":
      return {
        resolution: "D",
        from: to - 365 * SECONDS_PER_DAY,
        to,
        interval: "1day",
        isIntraday: false,
      };
  }
}
