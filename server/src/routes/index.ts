import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { newsRoutes } from "./news.routes.js";
import { recommendationRoutes } from "./recommendation.routes.js";
import { stockRoutes } from "./stock.routes.js";
import { watchlistRoutes } from "./watchlist.routes.js";

/** Aggregates all API route modules mounted under /api. */
export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/watchlists", watchlistRoutes);
apiRoutes.use(newsRoutes);
apiRoutes.use(recommendationRoutes);
apiRoutes.use(stockRoutes);