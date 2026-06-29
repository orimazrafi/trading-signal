import type { Prisma, Signal } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type { CreateSignalInput, SignalRecord } from "../types/signal.js";

/** Maps a Prisma signal row to a domain record. */
function mapSignalRecord(signal: Signal): SignalRecord {
  return {
    id: signal.id,
    userId: signal.userId,
    symbol: signal.symbol,
    recommendation: signal.recommendation,
    price: signal.price,
    previousPrice: signal.previousPrice,
    changePercent: signal.changePercent,
    createdAt: signal.createdAt,
  };
}

/** Builds Prisma create input from a domain signal payload. */
function toSignalCreateInput(data: CreateSignalInput): Prisma.SignalUncheckedCreateInput {
  return {
    userId: data.userId,
    symbol: data.symbol,
    recommendation: data.recommendation,
    price: data.price,
    previousPrice: data.previousPrice,
    changePercent: data.changePercent,
  };
}

/** Persists a trading signal and returns the created domain record. */
export async function createSignalRecord(data: CreateSignalInput): Promise<SignalRecord> {
  const signal = await prisma.signal.create({ data: toSignalCreateInput(data) });
  return mapSignalRecord(signal);
}

/** Persists a trading signal for an individual user. */
export async function createSignal(data: CreateSignalInput): Promise<void> {
  await createSignalRecord(data);
}

/** Finds the most recent signal for a user and symbol. */
export async function findLatestSignalByUserAndSymbol(
  userId: string,
  symbol: string,
): Promise<SignalRecord | null> {
  const signal = await prisma.signal.findFirst({
    where: { userId, symbol },
    orderBy: { createdAt: "desc" },
  });

  return signal ? mapSignalRecord(signal) : null;
}

/** Finds a signal by id when it belongs to the user. */
export async function findSignalByIdAndUser(
  signalId: string,
  userId: string,
): Promise<SignalRecord | null> {
  const signal = await prisma.signal.findFirst({
    where: { id: signalId, userId },
  });

  return signal ? mapSignalRecord(signal) : null;
}
