import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { log } from "../lib/logger/index.js";
import { newsService } from "../services/news.service.js";

/** Returns market news; personalized when authenticated, full feed otherwise. */
export async function getDashboardNews(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const news = userId
      ? await newsService.getProcessedNewsForUser(userId)
      : await newsService.getPublicNewsFeed();

    res.status(HTTP_STATUS.OK).json({ news });
  } catch (error) {
    log.error("Controller endpoint execution failed", error, { path: req.path });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Unable to load market news" });
  }
}
