import { Router } from "express";
import { getDashboardRecommendations } from "../controllers/recommendation.controller.js";

/** Maps dashboard recommendation HTTP paths to controller handlers. */
export const recommendationRoutes = Router();

recommendationRoutes.get("/dashboard/recommendations", getDashboardRecommendations);
