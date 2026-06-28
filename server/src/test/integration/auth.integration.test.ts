import { API_BASE_PATH } from "@trading-signal/contracts/apiPath";
import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Application } from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadIntegrationModules } from "./loadIntegrationModules.js";
import {
  createTestEmail,
  resetIntegrationState,
  TEST_PASSWORD,
} from "./integrationTestUtils.js";

describe("auth HTTP integration", () => {
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

  it("signs up, returns the session user on /me, logs out, and logs back in", async () => {
    const email = createTestEmail("auth");
    const agent = request.agent(app);

    const signupResponse = await agent
      .post(`${API_BASE_PATH}/auth/signup`)
      .send({ email, password: TEST_PASSWORD })
      .expect(HTTP_STATUS.CREATED);

    expect(signupResponse.body.user).toEqual({
      userId: expect.any(String),
      email,
      pictureUrl: null,
    });

    const meResponse = await agent.get(`${API_BASE_PATH}/auth/me`).expect(HTTP_STATUS.OK);
    expect(meResponse.body.user.email).toBe(email);

    await agent.post(`${API_BASE_PATH}/auth/logout`).expect(HTTP_STATUS.OK);
    await agent.get(`${API_BASE_PATH}/auth/me`).expect(HTTP_STATUS.UNAUTHORIZED);

    const loginResponse = await agent
      .post(`${API_BASE_PATH}/auth/login`)
      .send({ email, password: TEST_PASSWORD })
      .expect(HTTP_STATUS.OK);

    expect(loginResponse.body.user.email).toBe(email);
    await agent.get(`${API_BASE_PATH}/auth/me`).expect(HTTP_STATUS.OK);
  });

  it("rejects /me without a session cookie", async () => {
    const response = await request(app).get(`${API_BASE_PATH}/auth/me`);

    expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});
