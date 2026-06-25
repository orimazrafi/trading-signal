import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { parseDashboardNewsQuery } from "../lib/parseDashboardNewsQuery.js";
import { sendNewsErrorResponse } from "../lib/newsHttpErrors.js";
import { newsService } from "../services/news.service.js";

/** Returns a paginated market news page; personalized when authenticated. */
export async function getDashboardNews(req: Request, res: Response): Promise<void> {
  try {
    const query = parseDashboardNewsQuery(req);
    const userId = req.user?.userId;
    const page = userId
      ? await newsService.getNewsFeedPageForUser(userId, query)
      : await newsService.getNewsFeedPage(query);

    res.status(HTTP_STATUS.OK).json(page);
  } catch (error) {
    sendNewsErrorResponse(res, error, req.path);
  }
}
