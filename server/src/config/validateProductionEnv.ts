import type { MarketDataProviderId } from "../providers/marketData/types.js";

/** Default JWT secret — must not be used in production. */
export const DEV_JWT_SECRET = "dev-jwt-secret-change-me";

/** Environment snapshot used for production startup validation. */
export type ProductionEnvSnapshot = {
  nodeEnv: string;
  jwtSecret: string;
  authAllowMock: boolean;
  databaseUrl: string;
  redisUrl: string;
  clientUrl: string;
  marketDataProvider: MarketDataProviderId;
  finnhubApiKey: string;
  twelveDataApiKey: string;
  googleClientId: string;
  googleClientSecret: string;
  stockCacheTtlSeconds: number;
  stockHistoryCacheTtlSeconds: number;
};

/** Throws when a required production env value is missing or blank. */
function assertNonEmpty(value: string, name: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${name} must be set in production`);
  }
}

/** Throws when a numeric TTL env value is invalid. */
function assertPositiveNumber(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number in production`);
  }
}

/** Throws when required production environment settings are missing or unsafe. */
export function validateProductionEnv(snapshot: ProductionEnvSnapshot): void {
  if (snapshot.nodeEnv !== "production") {
    return;
  }

  if (snapshot.jwtSecret === DEV_JWT_SECRET) {
    throw new Error("JWT_SECRET must be set to a secure value in production");
  }

  if (snapshot.authAllowMock) {
    throw new Error("AUTH_ALLOW_MOCK must not be enabled in production");
  }

  assertNonEmpty(snapshot.databaseUrl, "DATABASE_URL");
  assertNonEmpty(snapshot.redisUrl, "REDIS_URL");
  assertNonEmpty(snapshot.clientUrl, "CLIENT_URL");
  assertPositiveNumber(snapshot.stockCacheTtlSeconds, "STOCK_CACHE_TTL_SECONDS");
  assertPositiveNumber(snapshot.stockHistoryCacheTtlSeconds, "STOCK_HISTORY_CACHE_TTL_SECONDS");

  if (snapshot.marketDataProvider === "finnhub") {
    assertNonEmpty(snapshot.finnhubApiKey, "FINNHUB_API_KEY");
  }

  if (snapshot.marketDataProvider === "twelveData") {
    assertNonEmpty(snapshot.twelveDataApiKey, "TWELVE_DATA_API_KEY");
  }

  const googleConfigured =
    snapshot.googleClientId.length > 0 || snapshot.googleClientSecret.length > 0;

  if (googleConfigured) {
    assertNonEmpty(snapshot.googleClientId, "GOOGLE_CLIENT_ID");
    assertNonEmpty(snapshot.googleClientSecret, "GOOGLE_CLIENT_SECRET");
  }
}
