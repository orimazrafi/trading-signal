import { Router } from "express";
import { alertRoutes } from "./alert.routes.js";
import { authRoutes } from "./auth.routes.js";
import { newsRoutes } from "./news.routes.js";
import { recommendationRoutes } from "./recommendation.routes.js";
import { stockRoutes } from "./stock.routes.js";
import { watchlistRoutes } from "./watchlist.routes.js";

/** Aggregates all API route modules (mounted at API_BASE_PATH from contracts). */
export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/price-alerts", alertRoutes);
apiRoutes.use("/watchlists", watchlistRoutes);
apiRoutes.use(newsRoutes);
apiRoutes.use(recommendationRoutes);
apiRoutes.use(stockRoutes);