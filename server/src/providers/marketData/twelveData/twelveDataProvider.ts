import axios from "axios";
import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { env } from "../../../config/env.js";
import { log } from "../../../lib/logger/index.js";
import { StockError } from "../../../lib/stockError.js";
import { toStockProviderError } from "../../../lib/stockProviderErrors.js";
import {
  buildTwelveDataApiUrl,
  buildTwelveDataPressReleaseArticleUrl,
  requireTwelveDataApiKey,
  TWELVE_DATA_ENDPOINTS,
} from "../../../lib/twelveData.js";
import {
  requestTwelveDataPrice,
  requestTwelveDataProfile,
  requestTwelveDataStatistics,
} from "../../../lib/twelveDataClient.js";
import type { IncomingNewsArticle } from "../../../types/news.js";
import type { StockQuote } from "../../../types/stock.js";
import type { StockHistory, StockHistoryPoint, StockHistoryRange } from "../../../types/stockHistory.js";
import {
  isTwelveDataErrorPayload,
  type TwelveDataProfileResponse,
  type TwelveDataStatisticsResponse,
} from "../../../types/twelveData.js";
import type { MarketDataProvider } from "../types.js";

type TwelveDataTimeSeriesValue = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
};

type TwelveDataTimeSeriesResponse = {
  status?: string;
  code?: number;
  message?: string;
  values?: TwelveDataTimeSeriesValue[];
};

type TwelveDataPressRelease = {
  id: string;
  datetime: string;
  title: string;
};

type TwelveDataPressReleasesResponse = {
  status?: string;
  press_releases?: TwelveDataPressRelease[];
  code?: number;
  message?: string;
};

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase();
}

/** Maps a dashboard range label to Twelve Data outputsize. */
function resolveOutputSize(range: StockHistoryRange): number {
  switch (range) {
    case "1D":
      return 13;
    case "1W":
      return 5;
    case "1M":
      return 22;
    case "3M":
      return 66;
    case "6M":
      return 132;
    case "1Y":
      return 252;
  }
}

/** Maps a dashboard range label to a Twelve Data interval. */
function resolveHistoryInterval(range: StockHistoryRange): string {
  if (range === "1D") {
    return "30min";
  }

  return "1day";
}

/** Normalizes a Twelve Data datetime string to a chart-compatible time value. */
function normalizeBarTime(datetime: string, isIntraday: boolean): string | number {
  if (!isIntraday) {
    return datetime.slice(0, 10);
  }

  const normalized = datetime.includes("T") ? datetime : datetime.replace(" ", "T");
  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    return datetime.slice(0, 10);
  }

  return Math.floor(timestamp / 1000);
}

/** Maps Twelve Data responses to a StockQuote. */
function mapTwelveDataQuote(
  symbol: string,
  price: number,
  profile: TwelveDataProfileResponse | null,
  statistics: TwelveDataStatisticsResponse | null,
): StockQuote {
  const peRatio = statistics?.statistics?.valuations_metrics?.trailing_pe ?? 0;

  return {
    symbol,
    name: String(profile?.name ?? statistics?.meta?.name ?? `${symbol} Inc.`),
    price,
    peRatio: Number.isFinite(peRatio) ? peRatio : 0,
    sector: String(profile?.sector ?? profile?.industry ?? "Unknown"),
  };
}

/** Maps a Twelve Data bar to an internal history point. */
function mapTimeSeriesValue(value: TwelveDataTimeSeriesValue, isIntraday: boolean): StockHistoryPoint | null {
  const open = Number(value.open);
  const high = Number(value.high);
  const low = Number(value.low);
  const close = Number(value.close);
  const volume = Number(value.volume ?? 0);

  if ([open, high, low, close].some((price) => Number.isNaN(price))) {
    return null;
  }

  return {
    time: normalizeBarTime(value.datetime, isIntraday),
    open,
    high,
    low,
    close,
    volume: Number.isNaN(volume) ? 0 : volume,
  };
}

/** Twelve Data market data provider implementation. */
export function createTwelveDataProvider(): MarketDataProvider {
  return {
    id: "twelveData",

    /** Fetches a stock quote from Twelve Data endpoints. */
    async fetchQuote(symbol: string): Promise<StockQuote> {
      const normalizedSymbol = normalizeSymbol(symbol);

      try {
        const apiKey = requireTwelveDataApiKey();

        const [price, profile, statistics] = await Promise.all([
          fetchPriceFromApi(normalizedSymbol, apiKey),
          fetchProfileFromApi(normalizedSymbol, apiKey),
          fetchStatisticsFromApi(normalizedSymbol, apiKey),
        ]);

        return mapTwelveDataQuote(normalizedSymbol, price, profile, statistics);
      } catch (error) {
        throw toStockProviderError(error, `quote for ${normalizedSymbol}`);
      }
    },

    /** Fetches OHLCV bars from Twelve Data time series. */
    async fetchHistory(symbol: string, range: StockHistoryRange): Promise<StockHistory> {
      const normalizedSymbol = normalizeSymbol(symbol);
      const apiKey = requireTwelveDataApiKey();

      try {
        const { data } = await axios.get<TwelveDataTimeSeriesResponse>(
          buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.timeSeries, {
            symbol: normalizedSymbol,
            interval: resolveHistoryInterval(range),
            outputsize: String(resolveOutputSize(range)),
            apikey: apiKey,
            order: "ASC",
          }),
          { timeout: 10_000 },
        );

        if (data.code || data.status === "error") {
          throw new StockError(data.message ?? `Twelve Data time series failed for ${normalizedSymbol}`);
        }

        const isIntraday = range === "1D";
        const points = (data.values ?? [])
          .map((value) => mapTimeSeriesValue(value, isIntraday))
          .filter((point): point is StockHistoryPoint => point !== null);

        if (points.length === 0) {
          throw new StockError(`No history data returned for ${normalizedSymbol}`, HTTP_STATUS.NOT_FOUND);
        }

        return {
          symbol: normalizedSymbol,
          interval: resolveHistoryInterval(range),
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

    /** Fetches press releases for each symbol from Twelve Data. */
    async fetchNewsArticles(symbols: readonly string[]): Promise<IncomingNewsArticle[]> {
      const apiKey = requireTwelveDataApiKey();
      const articles: IncomingNewsArticle[] = [];

      for (const symbol of symbols) {
        const normalizedSymbol = normalizeSymbol(symbol);

        try {
          const { data } = await axios.get<TwelveDataPressReleasesResponse>(
            buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.pressReleases, {
              symbol: normalizedSymbol,
              outputsize: String(env.newsIngestBatchSize),
              apikey: apiKey,
            }),
            { timeout: 10_000 },
          );

          if (data.code || data.status === "error") {
            throw new Error(data.message ?? `Twelve Data press releases failed for ${normalizedSymbol}`);
          }

          for (const release of data.press_releases ?? []) {
            articles.push({
              title: release.title,
              url: buildTwelveDataPressReleaseArticleUrl(normalizedSymbol, release.id),
              source: `Twelve Data · ${normalizedSymbol}`,
              publishedAt: release.datetime,
              symbol: normalizedSymbol,
            });
          }
        } catch (error) {
          log.error("External API fetch failed", error, {
            provider: "twelveData",
            symbol: normalizedSymbol,
          });
        }
      }

      return articles.sort(
        (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
      );
    },
  };
}

/** Fetches the latest trade price from Twelve Data. */
async function fetchPriceFromApi(symbol: string, apiKey: string): Promise<number> {
  const response = await requestTwelveDataPrice(symbol, apiKey);

  if (isTwelveDataErrorPayload(response.data)) {
    throw new Error(response.data.message ?? `Twelve Data price failed for ${symbol}`);
  }

  const price = Number(response.data.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Twelve Data returned an invalid price for ${symbol}`);
  }

  return price;
}

/** Fetches company profile metadata used to enrich quote responses. */
async function fetchProfileFromApi(
  symbol: string,
  apiKey: string,
): Promise<TwelveDataProfileResponse | null> {
  try {
    const response = await requestTwelveDataProfile(symbol, apiKey);

    if (isTwelveDataErrorPayload(response.data)) {
      throw new Error(response.data.message ?? `Twelve Data profile failed for ${symbol}`);
    }

    return response.data;
  } catch (error) {
    log.error("External API fetch failed", error, { provider: "twelveData", symbol, endpoint: "profile" });
    return null;
  }
}

/** Fetches valuation statistics used to enrich quote responses. */
async function fetchStatisticsFromApi(
  symbol: string,
  apiKey: string,
): Promise<TwelveDataStatisticsResponse | null> {
  try {
    const response = await requestTwelveDataStatistics(symbol, apiKey);

    if (isTwelveDataErrorPayload(response.data)) {
      throw new Error(response.data.message ?? `Twelve Data statistics failed for ${symbol}`);
    }

    return response.data;
  } catch (error) {
    log.error("External API fetch failed", error, { provider: "twelveData", symbol, endpoint: "statistics" });
    return null;
  }
}

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validates a Twelve Data press release row at runtime. */
export function parseTwelveDataPressRelease(value: unknown): TwelveDataPressRelease | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, datetime, title } = value;

  if (typeof id !== "string" || typeof datetime !== "string" || typeof title !== "string") {
    return null;
  }

  return { id, datetime, title };
}
