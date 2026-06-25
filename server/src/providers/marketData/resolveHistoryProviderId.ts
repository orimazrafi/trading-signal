import { normalizeProviderEnvValue } from "./normalizeProviderEnvValue.js";
import type { MarketDataProviderId } from "./types.js";
import { isMarketDataProviderId } from "./resolveMarketDataProviderId.js";

/** History provider ids — includes yahoo (history-only fallback for Finnhub free tier). */
export const MARKET_DATA_HISTORY_PROVIDER_IDS = [
  "finnhub",
  "twelveData",
  "yahoo",
] as const;

export type MarketDataHistoryProviderId = (typeof MARKET_DATA_HISTORY_PROVIDER_IDS)[number];

/** Returns true when value is a supported history provider id. */
export function isMarketDataHistoryProviderId(
  value: string,
): value is MarketDataHistoryProviderId {
  return (MARKET_DATA_HISTORY_PROVIDER_IDS as readonly string[]).includes(value);
}

/** Parses MARKET_DATA_HISTORY_PROVIDER env value. */
export function resolveHistoryProviderIdFromEnv(
  value: string | undefined,
): MarketDataHistoryProviderId | null {
  const normalized = normalizeProviderEnvValue(value, "");
  if (!normalized) {
    return null;
  }

  if (normalized === "twelvedata" || normalized === "twelve_data" || normalized === "twelve-data") {
    return "twelveData";
  }

  if (isMarketDataHistoryProviderId(normalized)) {
    return normalized;
  }

  throw new Error(
    `Unsupported MARKET_DATA_HISTORY_PROVIDER "${value}". Use one of: ${MARKET_DATA_HISTORY_PROVIDER_IDS.join(", ")}`,
  );
}

/**
 * Resolves which provider serves chart history.
 * Finnhub free tier does not include candles — default history to Yahoo when main vendor is Finnhub.
 */
export function resolveHistoryProviderId(
  mainProvider: MarketDataProviderId,
  historyOverride: string | undefined,
): MarketDataHistoryProviderId {
  const explicit = resolveHistoryProviderIdFromEnv(historyOverride);
  if (explicit) {
    return explicit;
  }

  if (mainProvider === "finnhub") {
    return "yahoo";
  }

  if (isMarketDataProviderId(mainProvider)) {
    return mainProvider;
  }

  return "yahoo";
}
