import { Router } from "express";
import { getDashboardNews } from "../controllers/news.controller.js";

/** Maps dashboard news HTTP paths to controller handlers. */
export const newsRoutes = Router();

newsRoutes.get("/dashboard/news", getDashboardNews);
