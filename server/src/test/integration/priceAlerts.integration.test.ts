import { MAX_ALERTS_PER_USER } from "@trading-signal/contracts/alert.js";
import { API_BASE_PATH } from "@trading-signal/contracts/apiPath";
import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Application } from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadIntegrationModules } from "./loadIntegrationModules.js";
import { resetIntegrationState, signupAuthenticatedAgent } from "./integrationTestUtils.js";

describe("price alerts HTTP integration", () => {
  let app: Application;

  beforeAll(async () => {
    ({ app } = await loadIntegrationModules());
  });

  beforeEach(async () => {
    const { prisma, redis } = await loadIntegrationModules();
    await resetIntegrationState(prisma, redis);
  });

  afterAll(async () => {
    const { prisma, redis } = await loadIntegrationModules();
    await Promise.all([prisma.$disconnect(), redis.quit()]);
  });

  it("creates alerts, lists them with pagination meta, and rejects alerts beyond the per-user limit", async () => {
    const agent = await signupAuthenticatedAgent(app, API_BASE_PATH);
    const symbols = [
      "AAPL",
      "MSFT",
      "TSLA",
      "NVDA",
      "GOOGL",
      "AMZN",
      "META",
      "JPM",
      "XOM",
      "NFLX",
    ];

    for (const symbol of symbols) {
      const createResponse = await agent
        .post(`${API_BASE_PATH}/price-alerts`)
        .send({
          symbol,
          thresholdPercent: 2,
          emailEnabled: false,
          baselinePrice: 100,
        })
        .expect(HTTP_STATUS.CREATED);

      expect(createResponse.body.alert.symbol).toBe(symbol);
    }

    const listResponse = await agent
      .get(`${API_BASE_PATH}/price-alerts?page=1&limit=20`)
      .expect(HTTP_STATUS.OK);

    expect(listResponse.body.alerts).toHaveLength(MAX_ALERTS_PER_USER);
    expect(listResponse.body).toMatchObject({
      page: 1,
      limit: 20,
      total: MAX_ALERTS_PER_USER,
      hasMore: false,
    });

    const conflictResponse = await agent
      .post(`${API_BASE_PATH}/price-alerts`)
      .send({
        symbol: "AMD",
        thresholdPercent: 2,
        emailEnabled: false,
        baselinePrice: 100,
      })
      .expect(HTTP_STATUS.CONFLICT);

    expect(conflictResponse.body.error).toContain(String(MAX_ALERTS_PER_USER));
  });
});
