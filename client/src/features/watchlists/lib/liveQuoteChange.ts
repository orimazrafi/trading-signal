/** Computes percent change between a saved snapshot price and the live quote. */
export function computeLiveChangePercent(snapshotPrice: number, livePrice: number): number {
  if (!Number.isFinite(snapshotPrice) || snapshotPrice <= 0 || !Number.isFinite(livePrice)) {
    return 0
  }

  return ((livePrice - snapshotPrice) / snapshotPrice) * 100
}
