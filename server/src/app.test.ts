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

describe("GET /api/stock/:symbol", () => {
  it("requires authentication", async () => {
    const app = createApp();

    const response = await request(app).get("/api/stock/AAPL");

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});
