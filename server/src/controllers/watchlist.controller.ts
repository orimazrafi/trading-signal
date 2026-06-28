import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import type { Request, Response } from "express";
import { getAuthenticatedUserId } from "../lib/controllerAuth.js";
import { parseCreateWatchlistBody, parseWatchlistStockBody } from "../lib/parseWatchlistBody.js";
import { parsePaginationQuery } from "../lib/parsePaginationQuery.js";
import { sendWatchlistErrorResponse } from "../lib/watchlistHttpErrors.js";
import {
  createWatchlistView,
  getWatchlistsPageForUser,
  removeStockFromView,
  saveStockToView,
} from "../services/watchlist.service.js";

/** Creates a new named custom view for the authenticated user. */
export async function postWatchlist(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const { name } = parseCreateWatchlistBody(req.body);

  try {
    const watchlist = await createWatchlistView(userId, name);
    res.status(HTTP_STATUS.CREATED).json({ watchlist });
  } catch (error) {
    sendWatchlistErrorResponse(res, error, req.path);
  }
}

/** Returns paginated custom views for the authenticated user. */
export async function getWatchlists(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  try {
    const page = await getWatchlistsPageForUser(userId, parsePaginationQuery(req));
    res.json(page);
  } catch (error) {
    sendWatchlistErrorResponse(res, error, req.path);
  }
}

/** Saves a stock signal into a specific custom view. */
export async function postWatchlistStock(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const watchlistId = req.params.id?.trim() ?? "";
  const { symbol } = parseWatchlistStockBody(req.body);

  if (!watchlistId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Watchlist id is required" });
    return;
  }

  try {
    const stock = await saveStockToView(userId, watchlistId, symbol);
    res.status(HTTP_STATUS.CREATED).json({ stock });
  } catch (error) {
    sendWatchlistErrorResponse(res, error, req.path);
  }
}

/** Removes a stock signal from a specific custom view. */
export async function deleteWatchlistStock(req: Request, res: Response): Promise<void> {
  const userId = getAuthenticatedUserId(req, res);
  if (!userId) {
    return;
  }

  const watchlistId = req.params.id?.trim() ?? "";
  const signalId = req.params.signalId?.trim() ?? "";

  if (!watchlistId || !signalId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Watchlist id and signal id are required" });
    return;
  }

  try {
    await removeStockFromView(userId, watchlistId, signalId);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    sendWatchlistErrorResponse(res, error, req.path);
  }
}
