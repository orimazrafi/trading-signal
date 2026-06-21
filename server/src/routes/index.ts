import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { stockRoutes } from "./stock.routes.js";

/** Aggregates all API route modules mounted under /api. */
export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use(stockRoutes);