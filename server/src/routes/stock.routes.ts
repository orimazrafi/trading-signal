import { Router } from "express";
import { requireAuth } from "../controllers/auth.controller.js";
import {
  getHealth,
  getStockBySymbol,
  getTrending,
  searchStockBySymbol,
} from "../controllers/stock.controller.js";

/** Maps stock and dashboard HTTP paths to controller handlers. */
export const stockRoutes = Router();

stockRoutes.get("/health", getHealth);
stockRoutes.get("/stock/:symbol", getStockBySymbol);
stockRoutes.get("/stocks/:symbol/search", requireAuth, searchStockBySymbol);
stockRoutes.get("/dashboard/trending", requireAuth, getTrending);