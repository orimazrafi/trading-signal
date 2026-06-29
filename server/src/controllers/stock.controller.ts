import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { getAuthenticatedUserId } from "../lib/controllerAuth.js";
import { parseStockHistoryQuery } from "../lib/parseStockHistoryQuery/index.js";
import { sendStockErrorResponse } from "../lib/stockHttpErrors.js";
import { getStockHistory } from "../services/stock-history.service.js";
import {
  getStockQuote,
  getStockQuotes,
  searchStock,
} from "../services/stock.service.js";
import { parseStockQuotesBody } from "../lib/parseStockQuotesBody/index.js";

/** Returns historical OHLCV bars for the requested symbol. */
export async function getStockHistoryBySymbol(req: Request, res: Response): Promise<void> {
  const symbol = req.params.symbol?.trim();
  if (!symbol) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Stock symbol is required" });
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Stock symbol is required" });
    return;
  }

  try {
    const quote = await getStockQuote(symbol);
    res.json(quote);
  } catch (error) {
    sendStockErrorResponse(res, error, req.path);
  }
}

/** Returns stock quotes for multiple symbols in one request. */
export async function postStockQuotes(req: Request, res: Response): Promise<void> {
  const { symbols } = parseStockQuotesBody(req.body);

  if (symbols.length === 0) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "At least one stock symbol is required" });
    return;
  }

  try {
    const quotes = await getStockQuotes(symbols);
    res.json({ quotes });
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
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Stock symbol is required" });
    return;
  }

  try {
    const result = await searchStock(userId, symbol);
    res.json(result);
  } catch (error) {
    sendStockErrorResponse(res, error, req.path);
  }
}
