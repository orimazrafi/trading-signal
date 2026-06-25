import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import axios from "axios";
import { StockError } from "./stockError.js";

/** Returns true when error is an axios response with the given HTTP status. */
function isAxiosHttpStatus(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

/** Extracts a provider message from a market data JSON error body when present. */
function readProviderErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data;
  if (typeof data !== "object" || data === null) {
    return null;
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  if ("error" in data && typeof data.error === "string") {
    return data.error;
  }

  return null;
}

/** Maps market data provider / axios failures to a StockError with a user-facing message. */
export function toStockProviderError(error: unknown, context: string): StockError {
  if (error instanceof StockError) {
    return error;
  }

  if (
    error instanceof Error &&
    (error.message === "FINNHUB_API_KEY not configured" ||
      error.message === "TWELVE_DATA_API_KEY not configured")
  ) {
    return new StockError("Market data API key is not configured on the server.", HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  if (isAxiosHttpStatus(error, HTTP_STATUS.TOO_MANY_REQUESTS)) {
    return new StockError("Market data rate limit reached. Please try again shortly.", HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  if (isAxiosHttpStatus(error, HTTP_STATUS.FORBIDDEN)) {
    const providerMessage = readProviderErrorMessage(error);
    return new StockError(
      providerMessage ?? "Market data provider denied the request. Check your API key and plan.",
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }

  const providerMessage = readProviderErrorMessage(error);
  if (providerMessage) {
    return new StockError(providerMessage, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  const message = error instanceof Error ? error.message : `Unable to fetch ${context}`;
  return new StockError(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
}
