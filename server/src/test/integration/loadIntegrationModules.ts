import type { Application } from "express";
import type { PrismaClient } from "@prisma/client";
import type { Redis } from "ioredis";

type IntegrationModules = {
  app: Application;
  prisma: PrismaClient;
  redis: Redis;
};

let cachedModules: IntegrationModules | undefined;

/** Dynamically loads the Express app and infrastructure clients after test env is applied. */
export async function loadIntegrationModules(): Promise<IntegrationModules> {
  if (cachedModules) {
    return cachedModules;
  }

  const [{ createApp }, { prisma }, { redis }] = await Promise.all([
    import("../../app.js"),
    import("../../config/prisma.js"),
    import("../../config/redis.js"),
  ]);

  await Promise.all([prisma.$connect(), redis.connect()]);

  cachedModules = {
    app: createApp(),
    prisma,
    redis,
  };

  return cachedModules;
}
