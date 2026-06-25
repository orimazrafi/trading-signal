import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { sendNewsErrorResponse } from "../lib/newsHttpErrors.js";
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
    sendNewsErrorResponse(res, error, req.path);
  }
}
