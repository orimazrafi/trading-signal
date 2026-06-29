import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { API_BASE_PATH } from "@trading-signal/contracts/apiPath";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("returns service health without authentication", async () => {
    const app = createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body.service).toBe("trading-signal-server");
    expect(typeof response.body.database?.connected).toBe("boolean");
    expect(typeof response.body.redis?.connected).toBe("boolean");
  });
});

describe(`GET ${API_BASE_PATH}/dashboard/news`, () => {
  it(
    "returns market news without authentication",
    async () => {
      const app = createApp();

      const response = await request(app).get(`${API_BASE_PATH}/dashboard/news`);

      expect([
        HTTP_STATUS.OK,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ]).toContain(response.status);

      if (response.status === HTTP_STATUS.OK) {
        expect(Array.isArray(response.body.news)).toBe(true);
        expect(typeof response.body.hasMore).toBe("boolean");
        expect(typeof response.body.nextOffset).toBe("number");
      }
    },
    15_000,
  );
});

describe(`GET ${API_BASE_PATH}/stock/:symbol`, () => {
  it("requires authentication", async () => {
    const app = createApp();

    const response = await request(app).get(`${API_BASE_PATH}/stock/AAPL`);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});

describe(`GET ${API_BASE_PATH}/does-not-exist`, () => {
  it("returns 404 for unknown routes", async () => {
    const app = createApp();

    const response = await request(app).get(`${API_BASE_PATH}/does-not-exist`);

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
