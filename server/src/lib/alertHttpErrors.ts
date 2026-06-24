import type { Response } from "express";
import { log } from "./logger/index.js";
import { AlertError } from "../services/alert.service.js";

/** Maps alert service errors to HTTP responses. */
export function sendAlertErrorResponse(res: Response, error: unknown, path: string): void {
  if (error instanceof AlertError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(500).json({ error: "Alert request failed" });
}
