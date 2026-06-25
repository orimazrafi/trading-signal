import { log } from "../../../lib/logger/index.js";
import { finnhubGet } from "./client.js";

/** Logs a Finnhub request failure without rethrowing. */
export function logFinnhubFetchError(error: unknown, symbol: string, endpoint: string): void {
  log.error("External API fetch failed", error, {
    provider: "finnhub",
    symbol,
    endpoint,
  });
}

/** Fetches a Finnhub endpoint and returns null when enrichment data is unavailable. */
export async function fetchOptionalFinnhub<T>(
  path: string,
  params: Record<string, string>,
  symbol: string,
  endpoint: string,
): Promise<T | null> {
  try {
    return await finnhubGet<T>(path, params);
  } catch (error) {
    logFinnhubFetchError(error, symbol, endpoint);
    return null;
  }
}
