/** Twelve Data REST API base URL. */
export const TWELVE_DATA_API_BASE_URL = "https://api.twelvedata.com";

/** Twelve Data public website base URL. */
export const TWELVE_DATA_WEB_BASE_URL = "https://twelvedata.com";

/** Twelve Data API endpoint path segments. */
export const TWELVE_DATA_ENDPOINTS = {
  price: "price",
  statistics: "statistics",
  profile: "profile",
  timeSeries: "time_series",
  pressReleases: "press_releases",
} as const;

/** Builds a Twelve Data API URL with query parameters. */
export function buildTwelveDataApiUrl(
  endpoint: string,
  params: Record<string, string>,
): string {
  const search = new URLSearchParams(params);
  return `${TWELVE_DATA_API_BASE_URL}/${endpoint}?${search.toString()}`;
}

/** Builds a public press release article URL for a symbol. */
export function buildTwelveDataPressReleaseArticleUrl(
  symbol: string,
  releaseId: string,
): string {
  return `${TWELVE_DATA_WEB_BASE_URL}/press_releases?symbol=${encodeURIComponent(symbol)}#${encodeURIComponent(releaseId)}`;
}
