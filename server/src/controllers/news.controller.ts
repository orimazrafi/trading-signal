import type { Request, Response } from "express";
import { log } from "../lib/logger.js";
import { newsService } from "../services/news.service.js";

/** Returns market news filtered to the authenticated user's watchlist when possible. */
export async function getDashboardNews(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const news = await newsService.getProcessedNewsForUser(userId);
    res.status(200).json({ news });
  } catch (error) {
    log.error("Controller endpoint execution failed", error, { path: req.path });
    res.status(500).json({ error: "Unable to load market news" });
  }
}
