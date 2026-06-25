import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { validateProductionEnv } from "./config/validateProductionEnv.js";
import { getCorsOptions } from "./lib/corsOptions.js";
import { apiRoutes } from "./routes/index.js";

const JSON_BODY_LIMIT = "1mb";

/** Builds the Express application without binding a port (for tests and server startup). */
export function createApp(): express.Application {
  validateProductionEnv(env.nodeEnv, env.jwtSecret, env.authAllowMock);

  const app = express();
  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(cookieParser());
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use("/api", apiRoutes);

  return app;
}
