import { describe, expect, it } from "vitest";
import { DEV_JWT_SECRET, validateProductionEnv, type ProductionEnvSnapshot } from "./validateProductionEnv.js";

const VALID_PRODUCTION_ENV: ProductionEnvSnapshot = {
  nodeEnv: "production",
  jwtSecret: "secure-production-secret",
  authAllowMock: false,
  databaseUrl: "postgresql://user:pass@db:5432/trading_signal",
  redisUrl: "redis://redis:6379",
  clientUrl: "https://app.example.com",
  marketDataProvider: "finnhub",
  finnhubApiKey: "finnhub-key",
  twelveDataApiKey: "",
  googleClientId: "",
  googleClientSecret: "",
  stockCacheTtlSeconds: 300,
  stockHistoryCacheTtlSeconds: 3600,
};

describe("validateProductionEnv", () => {
  it("allows development defaults", () => {
    expect(() =>
      validateProductionEnv({
        ...VALID_PRODUCTION_ENV,
        nodeEnv: "development",
        jwtSecret: DEV_JWT_SECRET,
        authAllowMock: true,
        databaseUrl: "",
        redisUrl: "",
        finnhubApiKey: "",
      }),
    ).not.toThrow();
  });

  it("rejects the default JWT secret in production", () => {
    expect(() =>
      validateProductionEnv({
        ...VALID_PRODUCTION_ENV,
        jwtSecret: DEV_JWT_SECRET,
      }),
    ).toThrow(/JWT_SECRET/);
  });

  it("rejects mock auth in production", () => {
    expect(() =>
      validateProductionEnv({
        ...VALID_PRODUCTION_ENV,
        authAllowMock: true,
      }),
    ).toThrow(/AUTH_ALLOW_MOCK/);
  });

  it("requires DATABASE_URL in production", () => {
    expect(() =>
      validateProductionEnv({
        ...VALID_PRODUCTION_ENV,
        databaseUrl: "",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("requires FINNHUB_API_KEY when using Finnhub in production", () => {
    expect(() =>
      validateProductionEnv({
        ...VALID_PRODUCTION_ENV,
        finnhubApiKey: "",
      }),
    ).toThrow(/FINNHUB_API_KEY/);
  });

  it("requires paired Google OAuth credentials when partially configured", () => {
    expect(() =>
      validateProductionEnv({
        ...VALID_PRODUCTION_ENV,
        googleClientId: "client-id",
        googleClientSecret: "",
      }),
    ).toThrow(/GOOGLE_CLIENT_SECRET/);
  });

  it("accepts a complete production configuration", () => {
    expect(() => validateProductionEnv(VALID_PRODUCTION_ENV)).not.toThrow();
  });
});
