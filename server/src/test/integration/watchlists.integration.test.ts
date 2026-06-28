import { API_BASE_PATH } from "@trading-signal/contracts/apiPath";
import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Application } from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadIntegrationModules } from "./loadIntegrationModules.js";
import {
  resetIntegrationState,
  seedStockSignal,
  signupAuthenticatedAgent,
} from "./integrationTestUtils.js";

describe("watchlists HTTP integration", () => {
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

  it("creates a custom view, lists it with pagination meta, and adds a stock", async () => {
    const agent = await signupAuthenticatedAgent(app, API_BASE_PATH);

    const createResponse = await agent
      .post(`${API_BASE_PATH}/watchlists`)
      .send({ name: "Tech" })
      .expect(HTTP_STATUS.CREATED);

    const watchlistId = createResponse.body.watchlist.id;
    expect(createResponse.body.watchlist.name).toBe("Tech");

    const listResponse = await agent
      .get(`${API_BASE_PATH}/watchlists?page=1&limit=20`)
      .expect(HTTP_STATUS.OK);

    expect(listResponse.body.total).toBeGreaterThanOrEqual(2);
    expect(listResponse.body).toMatchObject({
      page: 1,
      limit: 20,
      hasMore: false,
    });

    const techView = listResponse.body.watchlists.find(
      (watchlist: { id: string }) => watchlist.id === watchlistId,
    );
    expect(techView?.name).toBe("Tech");
    expect(techView?.stocks).toEqual([]);

    const { prisma } = await loadIntegrationModules();
    const meResponse = await agent.get(`${API_BASE_PATH}/auth/me`).expect(HTTP_STATUS.OK);
    const userId = meResponse.body.user.userId;

    await seedStockSignal(prisma, userId, "AAPL", {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 190.25,
      peRatio: 28,
      sector: "Technology",
    });

    const addStockResponse = await agent
      .post(`${API_BASE_PATH}/watchlists/${watchlistId}/stocks`)
      .send({ symbol: "AAPL" })
      .expect(HTTP_STATUS.CREATED);

    expect(addStockResponse.body.stock.symbol).toBe("AAPL");

    const refreshedList = await agent
      .get(`${API_BASE_PATH}/watchlists?page=1&limit=20`)
      .expect(HTTP_STATUS.OK);

    const refreshedTechView = refreshedList.body.watchlists.find(
      (watchlist: { id: string }) => watchlist.id === watchlistId,
    );

    expect(refreshedTechView?.stocks).toHaveLength(1);
    expect(refreshedTechView?.stocks[0]?.symbol).toBe("AAPL");
  });
});
