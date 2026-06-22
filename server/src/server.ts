import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectServerInfrastructure } from "./config/bootstrap.js";
import { env } from "./config/env.js";
import { log } from "./lib/logger.js";
import { apiRoutes } from "./routes/index.js";

/** Boots infrastructure connections and starts the Express API server. */
async function startServer(): Promise<void> {
  await connectServerInfrastructure();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api", apiRoutes);

  app.listen(env.port, () => {
    log.info("API listening", { port: env.port });
  });
}

startServer().catch((error) => {
  log.error("Fatal startup error", error);
  process.exit(1);
});
