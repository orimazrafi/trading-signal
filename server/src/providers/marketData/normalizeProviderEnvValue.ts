/** Normalizes a market data env token by trimming, lowercasing, and applying a fallback when unset. */
export function normalizeProviderEnvValue(value: string | undefined, fallback: string): string {
  return (value ?? fallback).trim().toLowerCase();
}
