import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("GET /api/health", () => {
  it("returns service health without authentication", async () => {
    const app = createApp();

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body).toEqual({
      status: "ok",
      service: "trading-signal-server",
    });
  });
});

describe("GET /api/dashboard/news", () => {
  it("returns market news without authentication", async () => {
    const app = createApp();

    const response = await request(app).get("/api/dashboard/news");

    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(response.body.news)).toBe(true);
    expect(typeof response.body.hasMore).toBe("boolean");
    expect(typeof response.body.nextOffset).toBe("number");
  });
});

describe("GET /api/stock/:symbol", () => {
  it("requires authentication", async () => {
    const app = createApp();

    const response = await request(app).get("/api/stock/AAPL");

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});

describe("unknown API routes", () => {
  it("returns 404 for unmatched paths", async () => {
    const app = createApp();

    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
