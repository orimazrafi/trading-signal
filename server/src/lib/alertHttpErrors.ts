import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Response } from "express";
import { log } from "./logger/index.js";
import { AlertError } from "./alertError.js";

/** Maps alert service errors to HTTP responses. */
export function sendAlertErrorResponse(res: Response, error: unknown, path: string): void {
  if (error instanceof AlertError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Alert request failed" });
}
