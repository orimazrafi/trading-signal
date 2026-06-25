import type { CorsOptions } from "cors";
import { env } from "../config/env.js";

/** Returns CORS settings: locked to CLIENT_URL in production, permissive in development. */
export function getCorsOptions(): CorsOptions {
  if (env.nodeEnv === "production") {
    return {
      origin: env.clientUrl,
      credentials: true,
    };
  }

  return {
    origin: true,
    credentials: true,
  };
}
