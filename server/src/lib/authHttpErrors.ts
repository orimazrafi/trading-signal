import type { Response } from "express";
import { log } from "./logger/index.js";
import { AuthError } from "../services/auth.service.js";

/** Maps auth service errors to HTTP responses. */
export function sendAuthErrorResponse(res: Response, error: unknown, path: string): void {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(500).json({ error: "Authentication failed" });
}
