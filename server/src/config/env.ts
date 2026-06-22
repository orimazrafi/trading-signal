import type { AuthenticatedUser } from "../types/auth.js";
import { parseDurationToMs } from "../lib/parseDurationToMs.js";

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
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY,
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
  surgeThresholdPercent: 1.5,
  mockUser: {
    userId: "user-mock-default",
    email: "demo@trading-signal.local",
  } satisfies AuthenticatedUser,
} as const;