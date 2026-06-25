import axios from "axios";
import { env } from "../../../config/env.js";

/** Finnhub REST API base URL. */
export const FINNHUB_API_BASE_URL = "https://finnhub.io/api/v1";

/** Finnhub HTTP request timeout in milliseconds. */
export const FINNHUB_REQUEST_TIMEOUT_MS = 10_000;

/** Returns the configured Finnhub API token or throws when missing. */
export function requireFinnhubApiKey(): string {
  if (!env.finnhubApiKey) {
    throw new Error("FINNHUB_API_KEY not configured");
  }

  return env.finnhubApiKey;
}

/** Performs a GET request against the Finnhub REST API. */
export async function finnhubGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = requireFinnhubApiKey();
  const { data } = await axios.get<T>(`${FINNHUB_API_BASE_URL}${path}`, {
    params: { ...params, token },
    timeout: FINNHUB_REQUEST_TIMEOUT_MS,
  });

  return data;
}
