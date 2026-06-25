import { HTTP_STATUS, type HttpStatusCode } from "@trading-signal/contracts/httpStatus";
import type { NextFunction, Request, Response } from "express";
import { log } from "./logger/index.js";

type DomainHttpError = Error & { statusCode: HttpStatusCode };

/** Returns true when an error carries an HTTP status code from a domain error class. */
function isDomainHttpError(error: unknown): error is DomainHttpError {
  if (!(error instanceof Error) || !("statusCode" in error)) {
    return false;
  }

  const statusCode = error.statusCode;
  return typeof statusCode === "number";
}

/** Handles requests that do not match any registered API route. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Not found" });
}

/** Central Express error handler for unhandled throws and forwarded errors. */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (isDomainHttpError(error)) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Unhandled request error", error, { path: req.path, method: req.method });
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
}
