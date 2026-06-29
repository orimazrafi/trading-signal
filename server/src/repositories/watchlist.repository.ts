import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { prisma } from "../config/prisma.js";
import { isPrismaUniqueViolation } from "../lib/prismaErrors.js";
import { WatchlistError } from "../lib/watchlistError.js";
import type { WatchlistStock, WatchlistWithStocks } from "../types/watchlist.js";

const watchlistWithItems = {
  items: {
    include: {
      signal: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
} as const;

type WatchlistRow = {
  id: string;
  name: string;
  createdAt: Date;
  items: Array<{
    signal: {
      id: string;
      symbol: string;
      recommendation: string;
      price: number;
      previousPrice: number;
      changePercent: number;
      createdAt: Date;
    };
  }>;
};

/** Maps a watchlist row with items to a domain watchlist payload. */
function mapWatchlistWithStocks(watchlist: WatchlistRow): WatchlistWithStocks {
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

/** Maps a linked watchlist item row to a domain stock payload. */
function mapWatchlistStock(item: WatchlistRow["items"][number]): WatchlistStock {
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

/** Creates a new custom view for the user. */
export async function createWatchlist(userId: string, name: string): Promise<WatchlistWithStocks> {
  try {
    const watchlist = await prisma.watchlist.create({
      data: { userId, name },
      include: watchlistWithItems,
    });

    return mapWatchlistWithStocks(watchlist);
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      throw new WatchlistError("A watchlist with this name already exists", HTTP_STATUS.CONFLICT);
    }

    throw error;
  }
}

/** Fetches paginated custom views for a user with linked signals. */
export async function getUserWatchlistsPaginated(userId: string, skip: number, take: number) {
  const [watchlists, total] = await Promise.all([
    prisma.watchlist.findMany({
      where: { userId },
      include: watchlistWithItems,
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
    prisma.watchlist.count({ where: { userId } }),
  ]);

  return {
    watchlists: watchlists.map(mapWatchlistWithStocks),
    total,
  };
}

/** Fetches all custom views for a user with linked signals. */
export async function getUserWatchlists(userId: string): Promise<WatchlistWithStocks[]> {
  const { watchlists } = await getUserWatchlistsPaginated(userId, 0, Number.MAX_SAFE_INTEGER);
  return watchlists;
}

/** Finds a watchlist owned by the given user. */
export async function findWatchlistByIdAndUser(
  watchlistId: string,
  userId: string,
): Promise<WatchlistWithStocks | null> {
  const watchlist = await prisma.watchlist.findFirst({
    where: { id: watchlistId, userId },
    include: watchlistWithItems,
  });

  return watchlist ? mapWatchlistWithStocks(watchlist) : null;
}

/** Connects a signal to a custom view. */
export async function addStockToWatchlist(
  watchlistId: string,
  signalId: string,
): Promise<WatchlistStock> {
  const item = await prisma.watchlistItem.create({
    data: { watchlistId, signalId },
    include: {
      signal: true,
    },
  });

  return mapWatchlistStock(item);
}

/** Removes a linked signal from a custom view. */
export async function removeStockFromWatchlist(watchlistId: string, signalId: string) {
  return prisma.watchlistItem.deleteMany({
    where: { watchlistId, signalId },
  });
}

/** Returns distinct symbols linked across all watchlists for a user. */
export async function getDistinctWatchlistSymbols(userId: string): Promise<string[]> {
  const items = await prisma.watchlistItem.findMany({
    where: {
      watchlist: { userId },
    },
    select: {
      signal: {
        select: { symbol: true },
      },
    },
  });

  const symbols = new Set<string>();

  for (const item of items) {
    symbols.add(item.signal.symbol);
  }

  return [...symbols].sort();
}

/** Returns true when the signal is already linked to the watchlist. */
export async function isSignalInWatchlist(watchlistId: string, signalId: string): Promise<boolean> {
  const existing = await prisma.watchlistItem.findUnique({
    where: {
      watchlistId_signalId: { watchlistId, signalId },
    },
    select: { id: true },
  });

  return existing !== null;
}
