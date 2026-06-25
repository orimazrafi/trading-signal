import { normalizeProviderEnvValue } from "./normalizeProviderEnvValue.js";
import { MARKET_DATA_PROVIDER_IDS, type MarketDataProviderId } from "./types.js";

/** Returns true when value is a supported market data provider id. */
export function isMarketDataProviderId(value: string): value is MarketDataProviderId {
  return (MARKET_DATA_PROVIDER_IDS as readonly string[]).includes(value);
}

/** Parses MARKET_DATA_PROVIDER env value; defaults to finnhub. */
export function resolveMarketDataProviderId(value: string | undefined): MarketDataProviderId {
  const normalized = normalizeProviderEnvValue(value, "finnhub");

  if (normalized === "finnhub") {
    return "finnhub";
  }

  if (normalized === "twelvedata" || normalized === "twelve_data" || normalized === "twelve-data") {
    return "twelveData";
  }

  if (normalized === "yahoo") {
    return "yahoo";
  }

  if (isMarketDataProviderId(normalized)) {
    return normalized;
  }

  throw new Error(
    `Unsupported MARKET_DATA_PROVIDER "${value}". Use one of: ${MARKET_DATA_PROVIDER_IDS.join(", ")}`,
  );
}
