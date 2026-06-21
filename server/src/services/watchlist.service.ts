import type { Signal, Watchlist, WatchlistItem } from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
  addStockToWatchlist,
  createWatchlist,
  findWatchlistByIdAndUser,
  getUserWatchlists,
  isSignalInWatchlist,
} from "../repositories/watchlist.repository.js";
import {
  findLatestSignalByUserAndSymbol,
  findSignalByIdAndUser,
} from "../repositories/signal.repository.js";
import { getCachedStockQuote, searchStock } from "./stock.service.js";

export class WatchlistError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
    this.name = "WatchlistError";
  }
}

type WatchlistWithItems = Watchlist & {
  items: Array<
    WatchlistItem & {
      signal: Signal;
    }
  >;
};

type WatchlistStockView = {
  signalId: string;
  symbol: string;
  recommendation: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  createdAt: Date;
};

export type WatchlistView = {
  id: string;
  name: string;
  createdAt: Date;
  stocks: WatchlistStockView[];
};

/** Normalizes and validates a custom view name. */
function normalizeWatchlistName(name: string): string {
  const normalized = name.trim();

  if (!normalized) {
    throw new WatchlistError("Watchlist name is required");
  }

  if (normalized.length > 80) {
    throw new WatchlistError("Watchlist name must be 80 characters or fewer");
  }

  return normalized;
}

/** Normalizes a ticker symbol to uppercase. */
function normalizeSymbol(symbol: string): string {
  const normalized = symbol.trim().toUpperCase();

  if (!normalized) {
    throw new WatchlistError("Stock symbol is required");
  }

  return normalized;
}

/** Maps a watchlist row to an API-friendly view payload. */
function mapWatchlistView(watchlist: WatchlistWithItems): WatchlistView {
  return {
    id: watchlist.id,
    name: watchlist.name,
    createdAt: watchlist.createdAt,
    stocks: watchlist.items.map((item) => ({
      signalId: item.signal.id,
      symbol: item.signal.symbol,
      recommendation: item.signal.recommendation,
      price: item.signal.price,
      previousPrice: item.signal.previousPrice,
      changePercent: item.signal.changePercent,
      createdAt: item.signal.createdAt,
    })),
  };
}

/** Ensures the watchlist exists and belongs to the user. */
async function assertWatchlistOwned(userId: string, watchlistId: string): Promise<WatchlistWithItems> {
  const watchlist = await findWatchlistByIdAndUser(watchlistId, userId);

  if (!watchlist) {
    throw new WatchlistError("Watchlist not found", 404);
  }

  return watchlist;
}

/** Reuses a cached signal or creates a fresh search signal for the symbol. */
async function resolveSignalForSymbol(userId: string, symbol: string): Promise<Signal> {
  const cachedQuote = await getCachedStockQuote(symbol);
  const existingSignal = await findLatestSignalByUserAndSymbol(userId, symbol);

  if (cachedQuote && existingSignal) {
    return existingSignal;
  }

  const searchResult = await searchStock(userId, symbol);
  const signal = await findSignalByIdAndUser(searchResult.signalId, userId);

  if (!signal) {
    throw new WatchlistError("Unable to resolve stock signal", 500);
  }

  return signal;
}

/** Creates a new custom view for the authenticated user. */
export async function createWatchlistView(userId: string, name: string): Promise<WatchlistView> {
  const normalizedName = normalizeWatchlistName(name);

  try {
    const watchlist = await createWatchlist(userId, normalizedName);
    return mapWatchlistView(watchlist);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new WatchlistError("A watchlist with this name already exists", 409);
    }

    throw error;
  }
}

/** Returns all custom views for the authenticated user. */
export async function getWatchlistsForUser(userId: string): Promise<WatchlistView[]> {
  const watchlists = await getUserWatchlists(userId);
  return watchlists.map(mapWatchlistView);
}

/** Saves a searched stock signal into a user-owned custom view. */
export async function saveStockToView(
  userId: string,
  watchlistId: string,
  symbol: string,
): Promise<WatchlistStockView> {
  await assertWatchlistOwned(userId, watchlistId);

  const normalizedSymbol = normalizeSymbol(symbol);
  const signal = await resolveSignalForSymbol(userId, normalizedSymbol);

  const alreadyLinked = await isSignalInWatchlist(watchlistId, signal.id);
  if (alreadyLinked) {
    return {
      signalId: signal.id,
      symbol: signal.symbol,
      recommendation: signal.recommendation,
      price: signal.price,
      previousPrice: signal.previousPrice,
      changePercent: signal.changePercent,
      createdAt: signal.createdAt,
    };
  }

  const item = await addStockToWatchlist(watchlistId, signal.id);

  return {
    signalId: item.signal.id,
    symbol: item.signal.symbol,
    recommendation: item.signal.recommendation,
    price: item.signal.price,
    previousPrice: item.signal.previousPrice,
    changePercent: item.signal.changePercent,
    createdAt: item.signal.createdAt,
  };
}
