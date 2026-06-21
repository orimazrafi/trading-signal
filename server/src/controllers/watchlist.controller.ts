import type { Request, Response } from "express";
import {
  WatchlistError,
  createWatchlistView,
  getWatchlistsForUser,
  saveStockToView,
} from "../services/watchlist.service.js";

/** Returns the authenticated user id or sends 401. */
function getAuthenticatedUserId(req: Request, res: Response): string | null {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return userId;
}

/** Maps watchlist service errors to HTTP responses. */
function handleWatchlistError(res: Response, error: unknown): void {
  if (error instanceof WatchlistError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error("[watchlist] Unexpected error:", error);
  res.status(500).json({ error: "Watchlist request failed" });
}

/** Creates a new named custom view for the authenticated user. */
export async function postWatchlist(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const name = typeof req.body?.name === "string" ? req.body.name : "";

  try {
    const watchlist = await createWatchlistView(userId, name);
    res.status(201).json({ watchlist });
  } catch (error) {
    handleWatchlistError(res, error);
  }
}

/** Returns all custom views for the authenticated user. */
export async function getWatchlists(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const watchlists = await getWatchlistsForUser(userId);
    res.json({ watchlists });
  } catch (error) {
    handleWatchlistError(res, error);
  }
}

/** Saves a stock signal into a specific custom view. */
export async function postWatchlistStock(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const watchlistId = req.params.id?.trim() ?? "";
  const symbol = typeof req.body?.symbol === "string" ? req.body.symbol : "";

  if (!watchlistId) {
    res.status(400).json({ error: "Watchlist id is required" });
    return;
  }

  try {
    const stock = await saveStockToView(userId, watchlistId, symbol);
    res.status(201).json({ stock });
  } catch (error) {
    handleWatchlistError(res, error);
  }
}
