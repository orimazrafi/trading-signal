import type { Request } from "express";
import { env } from "../config/env.js";

const REFRESH_QUERY_VALUES = new Set(["1", "true", "yes"]);

/** Parsed query parameters for GET /api/dashboard/news. */
export type DashboardNewsQuery = {
  limit: number;
  offset: number;
  refresh: boolean;
};

/** Returns true when a query value requests a forced provider refresh. */
function isRefreshRequested(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  return REFRESH_QUERY_VALUES.has(value.trim().toLowerCase());
}

/** Parses a non-negative integer query value, or null when invalid. */
function parseNonNegativeInt(value: unknown): number | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

/** Parses limit, offset, and refresh flags from the dashboard news request query. */
export function parseDashboardNewsQuery(req: Request): DashboardNewsQuery {
  const parsedLimit = parseNonNegativeInt(req.query.limit);
  const parsedOffset = parseNonNegativeInt(req.query.offset);

  const limit =
    parsedLimit === null
      ? env.newsDefaultPageSize
      : Math.min(parsedLimit, env.newsDefaultPageSize);

  const offset = parsedOffset ?? 0;

  return {
    limit,
    offset,
    refresh: isRefreshRequested(req.query.refresh),
  };
}
