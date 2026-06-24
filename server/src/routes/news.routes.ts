import { Router } from "express";
import { requireAuth } from "../controllers/auth.controller.js";
import { getDashboardNews } from "../controllers/news.controller.js";

/** Maps dashboard news HTTP paths to controller handlers. */
export const newsRoutes = Router();

newsRoutes.get("/dashboard/news", requireAuth, getDashboardNews);
