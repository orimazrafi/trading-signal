import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { log } from "../lib/logger/index.js";
import { parseRecommendationQuery } from "../lib/parseRecommendationQuery.js";
import { recommendationService } from "../services/recommendation.service.js";

/** Returns pre-computed stock recommendations, refreshing on cache miss when needed. */
export async function getDashboardRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const feed = await recommendationService.getRecommendations(parseRecommendationQuery(req.query));
    res.status(HTTP_STATUS.OK).json(feed);
  } catch (error) {
    log.error("Controller endpoint execution failed", error, { path: req.path });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Unable to load stock recommendations" });
  }
}
