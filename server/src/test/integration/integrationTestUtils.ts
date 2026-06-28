import type { Application } from "express";
import type { PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";
import request from "supertest";
import type { StockQuote } from "../../types/stock.js";
import { writeJsonToRedis } from "../../lib/redisJsonCache.js";
import { createUserPriceAlert } from "../../repositories/alert.repository.js";
import { createSignalRecord } from "../../repositories/signal.repository.js";

const TEST_PASSWORD = "integration-test-password";

/** Builds a unique integration-test email address. */
export function createTestEmail(label: string): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${label}-${suffix}@integration.test`;
}

/** Clears Postgres rows and Redis keys between integration scenarios. */
export async function resetIntegrationState(
  prisma: PrismaClient,
  redisClient: Redis,
): Promise<void> {
  await prisma.alertNotification.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.watchlistItem.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.user.deleteMany();
  await redisClient.flushdb();
}

/** Registers a user and returns a cookie-authenticated supertest agent. */
export async function signupAuthenticatedAgent(
  app: Application,
  apiBasePath: string,
  email = createTestEmail("user"),
  password = TEST_PASSWORD,
): Promise<ReturnType<typeof request.agent>> {
  const agent = request.agent(app);

  await agent
    .post(`${apiBasePath}/auth/signup`)
    .send({ email, password })
    .expect(201);

  return agent;
}

/** Seeds a cached quote and matching signal so watchlist routes avoid external APIs. */
export async function seedStockSignal(
  _prisma: PrismaClient,
  userId: string,
  symbol: string,
  quote: StockQuote,
) {
  await writeJsonToRedis(`stock:price:${symbol}`, quote, {
    ttlSeconds: 300,
    backup: true,
  });

  return createSignalRecord({
    userId,
    symbol,
    recommendation: "BUY",
    price: quote.price,
    previousPrice: quote.price * 0.99,
    changePercent: 1,
  });
}

/** Seeds a price alert via the repository for integration scenarios that need existing alerts. */
export async function seedUserPriceAlert(
  userId: string,
  input: {
    symbol: string;
    thresholdPercent: number;
    baselinePrice: number;
    emailEnabled?: boolean;
  },
) {
  return createUserPriceAlert({
    userId,
    symbol: input.symbol,
    thresholdPercent: input.thresholdPercent,
    baselinePrice: input.baselinePrice,
    emailEnabled: input.emailEnabled ?? false,
  });
}

export { TEST_PASSWORD };
