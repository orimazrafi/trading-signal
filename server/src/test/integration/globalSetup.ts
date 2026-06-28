import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RedisContainer } from "@testcontainers/redis";
import type { TestProject } from "vitest/node";

const serverRoot = path.resolve(fileURLToPath(import.meta.url), "../../..");

/** Starts Postgres and Redis containers, runs migrations, and exposes URLs to tests. */
export default async function globalSetup(project: TestProject): Promise<() => Promise<void>> {
  const postgres = await new PostgreSqlContainer("postgres:16-alpine").start();
  const redis = await new RedisContainer("redis:7-alpine").start();

  const integrationDatabaseUrl = postgres.getConnectionUri();
  const integrationRedisUrl = redis.getConnectionUrl();

  execSync("npx prisma db push --accept-data-loss --skip-generate", {
    cwd: serverRoot,
    env: {
      ...process.env,
      DATABASE_URL: integrationDatabaseUrl,
    },
    stdio: "inherit",
  });

  project.provide("integrationDatabaseUrl", integrationDatabaseUrl);
  project.provide("integrationRedisUrl", integrationRedisUrl);

  return async () => {
    await Promise.all([postgres.stop(), redis.stop()]);
  };
}
