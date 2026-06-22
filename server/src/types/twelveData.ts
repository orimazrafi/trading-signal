/** Common error fields on Twelve Data API responses. */
export type TwelveDataErrorPayload = {
  code?: number;
  message?: string;
  status?: string;
};

/** Twelve Data `/price` endpoint response. */
export type TwelveDataPriceResponse = TwelveDataErrorPayload & {
  price?: string;
};

/** Twelve Data `/profile` endpoint response. */
export type TwelveDataProfileResponse = TwelveDataErrorPayload & {
  name?: string;
  sector?: string;
  industry?: string;
};

/** Twelve Data `/statistics` endpoint response. */
export type TwelveDataStatisticsResponse = TwelveDataErrorPayload & {
  meta?: {
    name?: string;
  };
  statistics?: {
    valuations_metrics?: {
      trailing_pe?: number;
    };
  };
};

/** Returns true when Twelve Data responded with an error payload. */
export function isTwelveDataErrorPayload(data: TwelveDataErrorPayload): boolean {
  return Boolean(data.code || data.status === "error");
}
