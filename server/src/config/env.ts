import { buildDefaultGoogleCallbackUrl } from "@trading-signal/contracts/apiPath";
import type { AuthenticatedUser } from "../types/auth.js";
import { resolveMarketDataProviderId } from "../providers/marketData/resolveMarketDataProviderId.js";
import { DEV_JWT_SECRET } from "./validateProductionEnv.js";
import { parseDurationToMs } from "../lib/parseDurationToMs.js";

/** Trims an optional env string; empty when unset or whitespace-only. */
function trimEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

const nodeEnv = process.env.NODE_ENV ?? "development";

const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "1h";

const newsIngestIntervalMs = Number(process.env.NEWS_INGEST_INTERVAL_MS) || 300_000;
const recommendationsIntervalMs = Number(process.env.RECOMMENDATIONS_INTERVAL_MS) || 300_000;

/** Centralized environment configuration and app constants. */
export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv,
  databaseUrl: trimEnv(process.env.DATABASE_URL),
  jwtSecret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
  jwtExpiresIn,
  jwtExpiresInMs: parseDurationToMs(jwtExpiresIn),
  authAllowMock: process.env.AUTH_ALLOW_MOCK === "true",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:8080",
  googleClientId: (process.env.GOOGLE_CLIENT_ID ?? "").trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET ?? "").trim(),
  googleCallbackUrl: (
    process.env.GOOGLE_CALLBACK_URL ??
    buildDefaultGoogleCallbackUrl("http://localhost:3000")
  ).trim(),
  defaultListPage: 1,
  defaultListPageSize: Number(process.env.DEFAULT_LIST_PAGE_SIZE) || 20,
  maxListPageSize: Number(process.env.MAX_LIST_PAGE_SIZE) || 100,
  stockCacheTtlSeconds: Number(process.env.STOCK_CACHE_TTL_SECONDS) || 300,
  stockHistoryCacheTtlSeconds: Number(process.env.STOCK_HISTORY_CACHE_TTL_SECONDS) || 3600,
  marketDataProvider: resolveMarketDataProviderId(process.env.MARKET_DATA_PROVIDER),
  marketDataHistoryProvider: trimEnv(process.env.MARKET_DATA_HISTORY_PROVIDER),
  finnhubApiKey: trimEnv(process.env.FINNHUB_API_KEY),
  twelveDataApiKey: trimEnv(process.env.TWELVE_DATA_API_KEY),
  dashboardNewsRedisKey: "dashboard:news",
  dashboardNewsCacheTtlSeconds:
    Number(process.env.DASHBOARD_NEWS_CACHE_TTL_SECONDS) ||
    Math.max(60, Math.floor(newsIngestIntervalMs / 1000)),
  newsMaxArticles: 40,
  newsMaxPoolArticles: Number(process.env.NEWS_MAX_POOL_ARTICLES) || 80,
  newsDefaultPageSize: Number(process.env.NEWS_DEFAULT_PAGE_SIZE) || 15,
  dashboardNewsRefreshCountRedisKey: "dashboard:news:refresh-count",
  newsIngestEnabled: process.env.NEWS_INGEST_ENABLED !== "false",
  newsIngestIntervalMs,
  newsIngestBatchSize: Number(process.env.NEWS_INGEST_BATCH_SIZE) || 5,
  newsIngestSymbols: (process.env.NEWS_INGEST_SYMBOLS ?? "AAPL,MSFT,TSLA,NVDA,GOOGL")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean),
  dashboardRecommendationsRedisKey: "dashboard:recommendations",
  dashboardRecommendationsCacheTtlSeconds:
    Number(process.env.DASHBOARD_RECOMMENDATIONS_CACHE_TTL_SECONDS) ||
    Math.max(60, Math.floor(recommendationsIntervalMs / 1000)),
  recommendationsMaxItems: Number(process.env.RECOMMENDATIONS_MAX_ITEMS) || 20,
  recommendationsEnabled: process.env.RECOMMENDATIONS_ENABLED !== "false",
  recommendationsIntervalMs,
  recommendationSymbols: (
    process.env.RECOMMENDATION_SYMBOLS ??
    process.env.NEWS_INGEST_SYMBOLS ??
    "AAPL,MSFT,TSLA,NVDA,GOOGL,AMZN,META,JPM,XOM"
  )
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  resendApiKey: trimEnv(process.env.RESEND_API_KEY),
  emailFrom: trimEnv(process.env.EMAIL_FROM),
  alertCheckIntervalMs: Number(process.env.ALERT_CHECK_INTERVAL_MS) || 300_000,
  alertsEvaluationEnabled: process.env.ALERTS_EVALUATION_ENABLED !== "false",
  mockUser: {
    userId: "user-mock-default",
    email: "demo@trading-signal.local",
  } satisfies AuthenticatedUser,
} as const;