import { inject } from "vitest";

/** Applies container URLs and test-only env before integration modules load. */
process.env.DATABASE_URL = inject("integrationDatabaseUrl");
process.env.REDIS_URL = inject("integrationRedisUrl");
process.env.NODE_ENV = "test";
process.env.AUTH_ALLOW_MOCK = "false";
process.env.JWT_SECRET = "integration-test-jwt-secret-not-for-production";
process.env.MARKET_DATA_PROVIDER = "finnhub";
process.env.FINNHUB_API_KEY = "integration-test-finnhub-key";
