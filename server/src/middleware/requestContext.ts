import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { log } from "../lib/logger/index.js";

/** Assigns a correlation id and logs request duration on response finish. */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    log.info("HTTP request completed", {
      requestId,
      userId: req.user?.userId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
