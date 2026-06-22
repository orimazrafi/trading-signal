import axios from "axios";
import type {
  TwelveDataPriceResponse,
  TwelveDataProfileResponse,
  TwelveDataStatisticsResponse,
} from "../types/twelveData.js";
import { buildTwelveDataApiUrl, TWELVE_DATA_ENDPOINTS } from "./twelveData.js";

/** Twelve Data HTTP request timeout in milliseconds. */
export const TWELVE_DATA_REQUEST_TIMEOUT_MS = 8000;

/** Performs a raw Twelve Data price HTTP request. */
export async function requestTwelveDataPrice(symbol: string, apiKey: string) {
  return axios.get<TwelveDataPriceResponse>(
    buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.price, { symbol, apikey: apiKey }),
    { timeout: TWELVE_DATA_REQUEST_TIMEOUT_MS },
  );
}

/** Performs a raw Twelve Data profile HTTP request. */
export async function requestTwelveDataProfile(symbol: string, apiKey: string) {
  return axios.get<TwelveDataProfileResponse>(
    buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.profile, { symbol, apikey: apiKey }),
    { timeout: TWELVE_DATA_REQUEST_TIMEOUT_MS },
  );
}

/** Performs a raw Twelve Data statistics HTTP request. */
export async function requestTwelveDataStatistics(symbol: string, apiKey: string) {
  return axios.get<TwelveDataStatisticsResponse>(
    buildTwelveDataApiUrl(TWELVE_DATA_ENDPOINTS.statistics, { symbol, apikey: apiKey }),
    { timeout: TWELVE_DATA_REQUEST_TIMEOUT_MS },
  );
}
