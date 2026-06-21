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

/** Fetches all custom views for a user with linked signals. */
export async function getUserWatchlists(userId: string) {
  return prisma.watchlist.findMany({
    where: { userId },
    include: watchlistWithItems,
    orderBy: { createdAt: "asc" },
  });
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
