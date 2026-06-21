import { Router } from "express";
import { requireAuth } from "../controllers/auth.controller.js";
import {
  getHealth,
  getNews,
  getStockBySymbol,
  getTrending,
} from "../controllers/stock.controller.js";

/** Maps stock and dashboard HTTP paths to controller handlers. */
export const stockRoutes = Router();

stockRoutes.get("/health", getHealth);
stockRoutes.get("/stock/:symbol", getStockBySymbol);
stockRoutes.get("/dashboard/trending", requireAuth, getTrending);
stockRoutes.get("/dashboard/news", getNews);