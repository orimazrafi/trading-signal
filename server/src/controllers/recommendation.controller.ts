import type { Request, Response } from "express";
import { log } from "../lib/logger.js";
import { parseRecommendationQuery } from "../lib/parseRecommendationQuery.js";
import { recommendationService } from "../services/recommendation.service.js";

/** Returns pre-computed stock recommendations from the background worker. */
export async function getDashboardRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const recommendations = await recommendationService.getRecommendations(
      parseRecommendationQuery(req.query),
    );
    res.status(200).json({ recommendations });
  } catch (error) {
    log.error("Controller endpoint execution failed", error, { path: req.path });
    res.status(500).json({ error: "Unable to load stock recommendations" });
  }
}
