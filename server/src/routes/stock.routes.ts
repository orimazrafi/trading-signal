import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { stockQuoteRateLimiter } from "../lib/rateLimiters.js";
import {
  getStockBySymbol,
  getStockHistoryBySymbol,
  postStockQuotes,
  searchStockBySymbol,
} from "../controllers/stock.controller.js";

/** Maps stock and dashboard HTTP paths to controller handlers. */
export const stockRoutes = Router();

stockRoutes.get(
  "/stock/:symbol/history",
  stockQuoteRateLimiter,
  requireAuth,
  getStockHistoryBySymbol,
);
stockRoutes.get("/stock/:symbol", stockQuoteRateLimiter, requireAuth, getStockBySymbol);
stockRoutes.post("/stocks/quotes", stockQuoteRateLimiter, requireAuth, postStockQuotes);
stockRoutes.get("/stocks/:symbol/search", requireAuth, searchStockBySymbol);
