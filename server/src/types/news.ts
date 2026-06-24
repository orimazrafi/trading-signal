import type { NewsSentiment } from "./stock.js";

/** Raw article payload published to the market_news queue. */
export type IncomingNewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  symbol: string;
};

/** Processed article stored in Redis for the dashboard feed. */
export type ProcessedNewsArticle = {
  headline: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: NewsSentiment;
  symbol: string;
};
