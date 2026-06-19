import type { AuthenticatedUser } from "../types/auth.js";

/** Centralized environment configuration and app constants. */
export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
  stockCacheTtlSeconds: 60,
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY,
  rabbitmqUrl: process.env.RABBITMQ_URL ?? "amqp://localhost:5672",
  stockTicksQueue: "stock_ticks",
  surgeThresholdPercent: 1.5,
  mockUser: {
    userId: "user-mock-default",
    email: "demo@trading-signal.local",
  } satisfies AuthenticatedUser,
} as const;
