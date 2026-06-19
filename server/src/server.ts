import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectServerInfrastructure } from "./config/bootstrap.js";
import { env } from "./config/env.js";
import { authCookieMiddleware } from "./controllers/auth.controller.js";
import {
  getHealth,
  getNews,
  getStockBySymbol,
  getTrending,
} from "./controllers/stock.controller.js";

/** Boots infrastructure connections and starts the Express API server. */
async function startServer(): Promise<void> {
  await connectServerInfrastructure();

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(authCookieMiddleware);

  app.get("/api/health", getHealth);
  app.get("/api/stock/:symbol", getStockBySymbol);
  app.get("/api/dashboard/trending", getTrending);
  app.get("/api/dashboard/news", getNews);

  app.listen(env.port, () => {
    console.log(`[server] API listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("[server] Fatal startup error:", error);
  process.exit(1);
});
