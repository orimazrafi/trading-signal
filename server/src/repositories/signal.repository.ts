import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

/** Persists a trading signal for an individual user. */
export async function createSignal(
  data: Prisma.SignalUncheckedCreateInput,
): Promise<void> {
  await prisma.signal.create({ data });
}
