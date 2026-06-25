import YahooFinance from "yahoo-finance2";
import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { StockError } from "../../../lib/stockError.js";
import { toStockProviderError } from "../../../lib/stockProviderErrors.js";
import type { IncomingNewsArticle } from "../../../types/news.js";
import type { StockQuote } from "../../../types/stock.js";
import type { StockHistory, StockHistoryPoint, StockHistoryRange } from "../../../types/stockHistory.js";
import type { MarketDataProvider } from "../types.js";

const yahooFinance = new YahooFinance();

const MILLISECONDS_PER_DAY = 86_400_000;

type YahooChartInterval = "30m" | "1d";

type YahooChartParams = {
  period1: Date;
  interval: YahooChartInterval;
  intervalLabel: string;
  isIntraday: boolean;
};

type YahooChartQuote = {
  date: Date;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
};

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Maps a dashboard chart range to Yahoo Finance chart options. */
function resolveYahooChartParams(range: StockHistoryRange): YahooChartParams {
  const now = Date.now();

  switch (range) {
    case "1D":
      return {
        period1: new Date(now - MILLISECONDS_PER_DAY),
        interval: "30m",
        intervalLabel: "30min",
        isIntraday: true,
      };
    case "1W":
      return {
        period1: new Date(now - 7 * MILLISECONDS_PER_DAY),
        interval: "1d",
        intervalLabel: "1day",
        isIntraday: false,
      };
    case "1M":
      return {
        period1: new Date(now - 30 * MILLISECONDS_PER_DAY),
        interval: "1d",
        intervalLabel: "1day",
        isIntraday: false,
      };
    case "3M":
      return {
        period1: new Date(now - 90 * MILLISECONDS_PER_DAY),
        interval: "1d",
        intervalLabel: "1day",
        isIntraday: false,
      };
    case "6M":
      return {
        period1: new Date(now - 180 * MILLISECONDS_PER_DAY),
        interval: "1d",
        intervalLabel: "1day",
        isIntraday: false,
      };
    case "YTD":
      return {
        period1: new Date(Date.UTC(new Date(now).getUTCFullYear(), 0, 1)),
        interval: "1d",
        intervalLabel: "1day",
        isIntraday: false,
      };
    case "1Y":
      return {
        period1: new Date(now - 365 * MILLISECONDS_PER_DAY),
        interval: "1d",
        intervalLabel: "1day",
        isIntraday: false,
      };
  }
}

/** Returns true when value is a Yahoo chart quote row. */
function isYahooChartQuote(value: unknown): value is YahooChartQuote {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "date" in value && value.date instanceof Date;
}

/** Maps a Yahoo chart quote row to an internal history point. */
function mapYahooChartQuote(quote: YahooChartQuote, isIntraday: boolean): StockHistoryPoint | null {
  const open = Number(quote.open);
  const high = Number(quote.high);
  const low = Number(quote.low);
  const close = Number(quote.close);
  const volume = Number(quote.volume ?? 0);

  if ([open, high, low, close].some((value) => Number.isNaN(value))) {
    return null;
  }

  const time = isIntraday
    ? Math.floor(quote.date.getTime() / 1000)
    : quote.date.toISOString().slice(0, 10);

  return {
    time,
    open,
    high,
    low,
    close,
    volume: Number.isNaN(volume) ? 0 : volume,
  };
}

/** Yahoo Finance history provider (unofficial API; used when Finnhub free tier lacks candles). */
export function createYahooProvider(): MarketDataProvider {
  return {
    id: "yahoo",

    /** Yahoo provider is history-only in this app — quotes use the primary vendor. */
    async fetchQuote(_symbol: string): Promise<StockQuote> {
      throw new StockError("Yahoo provider does not serve live quotes in this app.", HTTP_STATUS.NOT_IMPLEMENTED);
    },

    /** Fetches OHLCV bars from Yahoo Finance chart data. */
    async fetchHistory(symbol: string, range: StockHistoryRange): Promise<StockHistory> {
      const normalizedSymbol = normalizeSymbol(symbol);
      const { period1, interval, intervalLabel, isIntraday } = resolveYahooChartParams(range);

      try {
        const result = await yahooFinance.chart(normalizedSymbol, {
          period1,
          interval,
        });

        const rawQuotes = result.quotes ?? [];
        const points = rawQuotes
          .filter(isYahooChartQuote)
          .map((quote) => mapYahooChartQuote(quote, isIntraday))
          .filter((point): point is StockHistoryPoint => point !== null);

        if (points.length === 0) {
          throw new StockError(`No history data returned for ${normalizedSymbol}`, HTTP_STATUS.NOT_FOUND);
        }

        return {
          symbol: normalizedSymbol,
          interval: intervalLabel,
          range,
          points,
        };
      } catch (error) {
        if (error instanceof StockError) {
          throw error;
        }

        throw toStockProviderError(error, `history for ${normalizedSymbol}`);
      }
    },

    /** Yahoo provider does not serve the dashboard news ingest path. */
    async fetchNewsArticles(_symbols: readonly string[]): Promise<IncomingNewsArticle[]> {
      return [];
    },
  };
}
