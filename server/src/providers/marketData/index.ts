import { env } from "../../config/env.js";
import { createFinnhubProvider } from "./finnhub/finnhubProvider.js";
import { resolveHistoryProviderId } from "./resolveHistoryProviderId.js";
import { resolveMarketDataProviderId } from "./resolveMarketDataProviderId.js";
import { createTwelveDataProvider } from "./twelveData/twelveDataProvider.js";
import type { MarketDataProvider, MarketDataProviderId } from "./types.js";
import { createYahooProvider } from "./yahoo/yahooProvider.js";

/** Builds a market data provider for the given vendor id. */
export function createMarketDataProvider(providerId: MarketDataProviderId): MarketDataProvider {
  switch (providerId) {
    case "finnhub":
      return createFinnhubProvider();
    case "twelveData":
      return createTwelveDataProvider();
    case "yahoo":
      return createYahooProvider();
  }
}

let cachedProvider: MarketDataProvider | null = null;
let cachedHistoryProvider: MarketDataProvider | null = null;

/** Returns the configured market data provider singleton (quotes, news). */
export function getMarketDataProvider(): MarketDataProvider {
  if (!cachedProvider) {
    cachedProvider = createMarketDataProvider(env.marketDataProvider);
  }

  return cachedProvider;
}

/** Returns the provider used for chart history (may differ from quotes on Finnhub free tier). */
export function getHistoryMarketDataProvider(): MarketDataProvider {
  if (!cachedHistoryProvider) {
    const historyProviderId = resolveHistoryProviderId(
      env.marketDataProvider,
      process.env.MARKET_DATA_HISTORY_PROVIDER,
    );
    cachedHistoryProvider = createMarketDataProvider(
      resolveMarketDataProviderId(historyProviderId),
    );
  }

  return cachedHistoryProvider;
}

/** Clears cached provider instances (for tests). */
export function resetMarketDataProviderForTests(): void {
  cachedProvider = null;
  cachedHistoryProvider = null;
}

export { resolveMarketDataProviderId } from "./resolveMarketDataProviderId.js";
export { resolveHistoryProviderId } from "./resolveHistoryProviderId.js";
export type { MarketDataProvider, MarketDataProviderId } from "./types.js";
