import { Router } from "express";
import { stockRoutes } from "./stock.routes.js";

/** Aggregates all API route modules mounted under /api. */
export const apiRoutes = Router();

apiRoutes.use(stockRoutes);
