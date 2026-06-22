import type { Request, Response } from "express";
import { log } from "../lib/logger.js";
import { newsService } from "../services/news.service.js";

/** Returns pre-processed market news compiled by the background worker. */
export async function getDashboardNews(req: Request, res: Response): Promise<void> {
  try {
    const news = await newsService.getProcessedNews();
    res.status(200).json({ news });
  } catch (error) {
    log.error("Controller endpoint execution failed", error, { path: req.path });
    res.status(500).json({ error: "Unable to load market news" });
  }
}
