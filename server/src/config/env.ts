import type { AuthenticatedUser } from "../types/auth.js";
import { parseDurationToMs } from "../lib/parseDurationToMs.js";

/** Trims an optional env string; empty when unset or whitespace-only. */
function trimEnv(value: string | undefined): string {
  return (value ?? "").trim();
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "1h";

/** Centralized environment configuration and app constants. */
export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  jwtExpiresIn,
  jwtExpiresInMs: parseDurationToMs(jwtExpiresIn),
  authAllowMock: process.env.AUTH_ALLOW_MOCK === "true",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:8080",
  googleClientId: (process.env.GOOGLE_CLIENT_ID ?? "").trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET ?? "").trim(),
  googleCallbackUrl: (
    process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:3000/api/auth/google/callback"
  ).trim(),
  stockCacheTtlSeconds: 60,
  stockHistoryCacheTtlSeconds: Number(process.env.STOCK_HISTORY_CACHE_TTL_SECONDS) || 3600,
  twelveDataApiKey: trimEnv(process.env.TWELVE_DATA_API_KEY),
  rabbitmqUrl: process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
  stockTicksQueue: "stock_ticks",
  marketNewsQueue: "market_news",
  dashboardNewsRedisKey: "dashboard:news",
  newsMaxArticles: 20,
  newsIngestEnabled: process.env.NEWS_INGEST_ENABLED !== "false",
  newsIngestIntervalMs: Number(process.env.NEWS_INGEST_INTERVAL_MS) || 300_000,
  newsIngestBatchSize: Number(process.env.NEWS_INGEST_BATCH_SIZE) || 5,
  newsIngestSymbols: (process.env.NEWS_INGEST_SYMBOLS ?? "AAPL,MSFT,TSLA,NVDA,GOOGL")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean),
  dashboardRecommendationsRedisKey: "dashboard:recommendations",
  recommendationsMaxItems: Number(process.env.RECOMMENDATIONS_MAX_ITEMS) || 20,
  recommendationsEnabled: process.env.RECOMMENDATIONS_ENABLED !== "false",
  recommendationsIntervalMs: Number(process.env.RECOMMENDATIONS_INTERVAL_MS) || 300_000,
  recommendationSymbols: (
    process.env.RECOMMENDATION_SYMBOLS ??
    process.env.NEWS_INGEST_SYMBOLS ??
    "AAPL,MSFT,TSLA,NVDA,GOOGL,AMZN,META,JPM,XOM"
  )
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean),
  surgeThresholdPercent: 1.5,
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  resendApiKey: trimEnv(process.env.RESEND_API_KEY),
  emailFrom: trimEnv(process.env.EMAIL_FROM),
  alertCheckIntervalMs: Number(process.env.ALERT_CHECK_INTERVAL_MS) || 300_000,
  mockUser: {
    userId: "user-mock-default",
    email: "demo@trading-signal.local",
  } satisfies AuthenticatedUser,
} as const;