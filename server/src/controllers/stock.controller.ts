import type { Request, Response } from "express";
import { getAuthenticatedUserId } from "../lib/controllerAuth.js";
import { parseStockHistoryQuery } from "../lib/parseStockHistoryQuery/index.js";
import { sendStockErrorResponse } from "../lib/stockHttpErrors.js";
import { getStockHistory } from "../services/stock-history.service.js";
import {
  getStockQuote,
  getTrendingStocks,
  searchStock,
} from "../services/stock.service.js";

/** Returns API health status. */
export function getHealth(_req: Request, res: Response): void {
  res.json({ status: "ok", service: "trading-signal-server" });
}

/** Returns historical OHLCV bars for the requested symbol. */
export async function getStockHistoryBySymbol(req: Request, res: Response): Promise<void> {
  const symbol = req.params.symbol?.trim();
  if (!symbol) {
    res.status(400).json({ error: "Stock symbol is required" });
    return;
  }

  const { range } = parseStockHistoryQuery(req.query);

  try {
    const history = await getStockHistory(symbol, range);
    res.json(history);
  } catch (error) {
    sendStockErrorResponse(res, error, req.path);
  }
}

/** Returns a stock quote for the requested symbol. */
export async function getStockBySymbol(req: Request, res: Response): Promise<void> {
  const symbol = req.params.symbol?.trim();
  if (!symbol) {
    res.status(400).json({ error: "Stock symbol is required" });
    return;
  }

  try {
    const quote = await getStockQuote(symbol);
    res.json(quote);
  } catch (error) {
    sendStockErrorResponse(res, error, req.path);
  }
}

/** Searches a stock, generates a recommendation, and persists a user signal. */
export async function searchStockBySymbol(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const symbol = req.params.symbol?.trim();
  if (!symbol) {
    res.status(400).json({ error: "Stock symbol is required" });
    return;
  }

  try {
    const result = await searchStock(userId, symbol);
    res.json(result);
  } catch (error) {
    sendStockErrorResponse(res, error, req.path);
  }
}

/** Returns top trending stocks for the authenticated user. */
export async function getTrending(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const trending = await getTrendingStocks(userId);
    res.json({ userId, trending });
  } catch (error) {
    sendStockErrorResponse(res, error, req.path);
  }
}
