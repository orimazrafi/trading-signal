import { z } from "zod";
import { paginationMetaSchema } from "./pagination.js";
import { safeParseApiResponse } from "./lib/zodApi.js";

export const apiWatchlistStockSchema = z.object({
  signalId: z.string(),
  symbol: z.string(),
  recommendation: z.string(),
  price: z.number().finite(),
  previousPrice: z.number().finite(),
  changePercent: z.number().finite(),
  createdAt: z.string(),
});

export const apiWatchlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  stocks: z.array(apiWatchlistStockSchema),
});

export const watchlistsResponseSchema = paginationMetaSchema.extend({
  watchlists: z.array(apiWatchlistSchema),
});

export const watchlistResponseSchema = z.object({
  watchlist: apiWatchlistSchema,
});

export const addStockResponseSchema = z.object({
  stock: apiWatchlistStockSchema,
});

export const removeStockResponseSchema = z.object({
  ok: z.boolean(),
});

/** Raw watchlist stock row from the watchlists API. */
export type ApiWatchlistStock = z.infer<typeof apiWatchlistStockSchema>;

/** Raw watchlist payload from the watchlists API. */
export type ApiWatchlist = z.infer<typeof apiWatchlistSchema>;

/** Response body for GET /api/watchlists. */
export type WatchlistsResponse = z.infer<typeof watchlistsResponseSchema>;

/** Response body for POST /api/watchlists. */
export type WatchlistResponse = z.infer<typeof watchlistResponseSchema>;

/** Response body for POST /api/watchlists/:id/stocks. */
export type AddStockResponse = z.infer<typeof addStockResponseSchema>;

/** Response body for DELETE /api/watchlists/:id/stocks/:signalId. */
export type RemoveStockResponse = z.infer<typeof removeStockResponseSchema>;

/** Validates a parsed JSON value as a watchlists list response. */
export function parseWatchlistsResponse(value: unknown): WatchlistsResponse | null {
  return safeParseApiResponse(watchlistsResponseSchema, value);
}

/** Validates a parsed JSON value as a single watchlist response. */
export function parseWatchlistResponse(value: unknown): WatchlistResponse | null {
  return safeParseApiResponse(watchlistResponseSchema, value);
}

/** Validates a parsed JSON value as an add-stock response. */
export function parseAddStockResponse(value: unknown): AddStockResponse | null {
  return safeParseApiResponse(addStockResponseSchema, value);
}

/** Validates a parsed JSON value as a remove-stock response. */
export function parseRemoveStockResponse(value: unknown): RemoveStockResponse | null {
  return safeParseApiResponse(removeStockResponseSchema, value);
}
