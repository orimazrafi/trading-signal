import type { Response } from "express";
import { log } from "./logger/index.js";
import { StockError } from "../services/stock.service.js";

/** Maps stock service errors to HTTP responses. */
export function sendStockErrorResponse(res: Response, error: unknown, path: string): void {
  if (error instanceof StockError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  log.error("Controller endpoint execution failed", error, { path });
  res.status(500).json({ error: "Stock request failed" });
}
