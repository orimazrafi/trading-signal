import { Redis } from "ioredis";
import { env } from "./env.js";

/** Shared Redis client for cache and leaderboard operations. */
export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});
