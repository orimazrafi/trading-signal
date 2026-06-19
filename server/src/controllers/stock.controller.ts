import type { Request, Response } from "express";
import { env } from "../config/env.js";
import {
  getMarketNews,
  getStockQuote,
  getTrendingStocks,
} from "../services/stock.service.js";

/** Returns API health status. */
export function getHealth(_req: Request, res: Response): void {
  res.json({ status: "ok", service: "trading-signal-server" });
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
    console.error(`[stock] Failed to resolve quote for ${symbol}:`, error);
    res.status(500).json({ error: "Unable to fetch stock data" });
  }
}

/** Returns top trending stocks for the authenticated user. */
export async function getTrending(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId ?? env.mockUser.userId;

  try {
    const trending = await getTrendingStocks(userId);
    res.json({ userId, trending });
  } catch (error) {
    console.error(`[dashboard] Failed to load trending for ${userId}:`, error);
    res.status(500).json({ error: "Unable to load trending stocks" });
  }
}

/** Returns mocked market news headlines with sentiment scores. */
export function getNews(_req: Request, res: Response): void {
  try {
    res.json({ news: getMarketNews() });
  } catch (error) {
    console.error("[dashboard] Failed to load news:", error);
    res.status(500).json({ error: "Unable to load market news" });
  }
}
