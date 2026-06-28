import { prisma } from "../config/prisma.js";

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

/** Creates a new custom view for the user. */
export async function createWatchlist(userId: string, name: string) {
  return prisma.watchlist.create({
    data: { userId, name },
    include: watchlistWithItems,
  });
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

  return { watchlists, total };
}

/** Fetches all custom views for a user with linked signals. */
export async function getUserWatchlists(userId: string) {
  const { watchlists } = await getUserWatchlistsPaginated(userId, 0, Number.MAX_SAFE_INTEGER);
  return watchlists;
}

/** Finds a watchlist owned by the given user. */
export async function findWatchlistByIdAndUser(watchlistId: string, userId: string) {
  return prisma.watchlist.findFirst({
    where: { id: watchlistId, userId },
    include: watchlistWithItems,
  });
}

/** Connects a signal to a custom view. */
export async function addStockToWatchlist(watchlistId: string, signalId: string) {
  return prisma.watchlistItem.create({
    data: { watchlistId, signalId },
    include: {
      signal: true,
    },
  });
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
