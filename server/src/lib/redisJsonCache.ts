import { redis } from "../config/redis.js";
import { log } from "./logger/index.js";
import { buildBackupCacheKey } from "./redisBackupCache.js";

type RedisJsonWriteOptions = {
  ttlSeconds?: number;
  backup?: boolean;
  logMessage?: string;
  logContext?: Record<string, unknown>;
};

/** Reads and parses a JSON value from Redis, or null on miss or parse failure. */
export async function readJsonFromRedis<T>(
  cacheKey: string,
  parse: (value: unknown) => T,
  logContext: Record<string, unknown> = {},
): Promise<T | null> {
  try {
    const cached = await redis.get(cacheKey);

    if (!cached) {
      return null;
    }

    return parse(JSON.parse(cached));
  } catch (error) {
    log.error("Redis read failed", error, { cacheKey, ...logContext });
    return null;
  }
}

/** Reads a backup JSON cache entry when the primary TTL entry has expired. */
export async function readJsonBackupFromRedis<T>(
  primaryCacheKey: string,
  parse: (value: unknown) => T,
  logContext: Record<string, unknown> = {},
): Promise<T | null> {
  return readJsonFromRedis(buildBackupCacheKey(primaryCacheKey), parse, {
    backup: true,
    ...logContext,
  });
}

/** Writes JSON to Redis with an optional TTL and backup key. */
export async function writeJsonToRedis(
  cacheKey: string,
  payload: unknown,
  options: RedisJsonWriteOptions = {},
): Promise<void> {
  const serialized = JSON.stringify(payload);

  try {
    if (options.ttlSeconds != null) {
      await redis.set(cacheKey, serialized, "EX", options.ttlSeconds);
    } else {
      await redis.set(cacheKey, serialized);
    }

    if (options.backup) {
      await redis.set(buildBackupCacheKey(cacheKey), serialized);
    }

    if (options.logMessage) {
      log.info(options.logMessage, { cacheKey, ...options.logContext });
    }
  } catch (error) {
    log.error("Redis write failed", error, { cacheKey, ...options.logContext });
  }
}
