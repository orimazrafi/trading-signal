import { Router } from "express";
import { requireAuth } from "../controllers/auth.controller.js";
import {
  deleteWatchlistStock,
  getWatchlists,
  postWatchlist,
  postWatchlistStock,
} from "../controllers/watchlist.controller.js";

/** Protected watchlist HTTP routes for custom dashboard views. */
export const watchlistRoutes = Router();

watchlistRoutes.post("/", requireAuth, postWatchlist);
watchlistRoutes.get("/", requireAuth, getWatchlists);
watchlistRoutes.post("/:id/stocks", requireAuth, postWatchlistStock);
watchlistRoutes.delete("/:id/stocks/:signalId", requireAuth, deleteWatchlistStock);
