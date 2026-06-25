import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Response } from "express";
import { log } from "./logger/index.js";
import { NewsFeedError } from "./newsError.js";

/** Maps news feed service errors to HTTP responses. */
export function sendNewsErrorResponse(res: Response, error: unknown, path: string): void {
  if (error instanceof NewsFeedError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Unable to load market news" });
}
