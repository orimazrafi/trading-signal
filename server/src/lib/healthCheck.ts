import { prisma } from "../config/prisma.js";
import { redis } from "../config/redis.js";

/** Connectivity status for a single infrastructure dependency. */
export type DependencyHealth = {
  connected: boolean;
};

/** Aggregated health payload for GET /health. */
export type HealthStatus = {
  status: "ok" | "degraded";
  service: string;
  database: DependencyHealth;
  redis: DependencyHealth;
};

/** Returns true when the database accepts a trivial query. */
async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/** Returns true when Redis responds to PING. */
async function isRedisConnected(): Promise<boolean> {
  try {
    const response = await redis.ping();
    return response === "PONG";
  } catch {
    return false;
  }
}

/** Checks database and Redis connectivity for orchestration health probes. */
export async function getHealthStatus(): Promise<HealthStatus> {
  const [databaseConnected, redisConnected] = await Promise.all([
    isDatabaseConnected(),
    isRedisConnected(),
  ]);

  const database = { connected: databaseConnected };
  const redisStatus = { connected: redisConnected };

  return {
    status: databaseConnected && redisConnected ? "ok" : "degraded",
    service: "trading-signal-server",
    database,
    redis: redisStatus,
  };
}
