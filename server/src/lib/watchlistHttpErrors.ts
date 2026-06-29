import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Response } from "express";
import { log } from "./logger/index.js";
import { WatchlistError } from "./watchlistError.js";

/** Maps watchlist service errors to HTTP responses. */
export function sendWatchlistErrorResponse(res: Response, error: unknown, path: string): void {
  if (error instanceof WatchlistError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Watchlist request failed" });
}
