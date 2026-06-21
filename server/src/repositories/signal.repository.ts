import type { Prisma, Signal } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/** Persists a trading signal and returns the created row. */
export async function createSignalRecord(
  data: Prisma.SignalUncheckedCreateInput,
): Promise<Signal> {
  return prisma.signal.create({ data });
}

/** Persists a trading signal for an individual user. */
export async function createSignal(data: Prisma.SignalUncheckedCreateInput): Promise<void> {
  await createSignalRecord(data);
}

/** Finds the most recent signal for a user and symbol. */
export async function findLatestSignalByUserAndSymbol(
  userId: string,
  symbol: string,
): Promise<Signal | null> {
  return prisma.signal.findFirst({
    where: { userId, symbol },
    orderBy: { createdAt: "desc" },
  });
}

/** Finds a signal by id when it belongs to the user. */
export async function findSignalByIdAndUser(
  signalId: string,
  userId: string,
): Promise<Signal | null> {
  return prisma.signal.findFirst({
    where: { id: signalId, userId },
  });
}
