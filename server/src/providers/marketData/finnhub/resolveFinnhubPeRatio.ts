import type { FinnhubMetricResponse } from "./types.js";

const FINNHUB_PE_METRIC_KEYS = [
  "peBasic",
  "peTTM",
  "peExclExtraTTM",
  "peInclExtraTTM",
  "peNormalizedAnnual",
] as const;

const FINNHUB_EPS_METRIC_KEYS = [
  "epsBasicExclExtraItemsTTM",
  "epsTTM",
  "epsExclExtraItemsTTM",
] as const;

/** Returns true when value is a plain object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Reads the first positive numeric field from a Finnhub metric object. */
function readPositiveMetricValue(
  metric: Record<string, unknown>,
  keys: readonly string[],
): number {
  for (const key of keys) {
    const value = Number(metric[key])

    if (Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return 0
}

/** Resolves P/E from Finnhub metric fields or price / EPS when direct P/E is missing. */
export function resolveFinnhubPeRatio(
  metrics: FinnhubMetricResponse | null,
  price: number,
): number {
  const metric = metrics?.metric

  if (!isRecord(metric)) {
    return 0
  }

  const directPe = readPositiveMetricValue(metric, FINNHUB_PE_METRIC_KEYS)

  if (directPe > 0) {
    return directPe
  }

  const eps = readPositiveMetricValue(metric, FINNHUB_EPS_METRIC_KEYS)

  if (eps > 0 && price > 0) {
    return price / eps
  }

  return 0
}
