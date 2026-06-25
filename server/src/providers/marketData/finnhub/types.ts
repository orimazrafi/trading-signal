/** Finnhub `/quote` response fields used by the app. */
export type FinnhubQuoteResponse = {
  c?: number;
  pc?: number;
};

/** Finnhub `/stock/profile2` response fields used by the app. */
export type FinnhubProfileResponse = {
  name?: string;
  finnhubIndustry?: string;
};

/** Finnhub `/stock/metric` response fields used by the app. */
export type FinnhubMetricResponse = {
  metric?: {
    peBasic?: number;
  };
};

/** Finnhub `/stock/candle` response. */
export type FinnhubCandleResponse = {
  s?: string;
  t?: number[];
  o?: number[];
  h?: number[];
  l?: number[];
  c?: number[];
  v?: number[];
};

/** Finnhub `/company-news` article row. */
export type FinnhubNewsArticle = {
  headline?: string;
  url?: string;
  source?: string;
  datetime?: number;
};
