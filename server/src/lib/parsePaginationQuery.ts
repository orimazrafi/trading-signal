import type { Request } from "express";
import { env } from "../config/env.js";

/** Parsed page/limit query mapped to Prisma skip/take. */
export type PaginationQuery = {
  page: number;
  limit: number;
  skip: number;
  take: number;
};

/** Parses a positive integer query value, or null when invalid. */
function parsePositiveInt(value: unknown): number | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

/** Parses page and limit query params for list endpoints. */
export function parsePaginationQuery(req: Request): PaginationQuery {
  const parsedPage = parsePositiveInt(req.query.page);
  const parsedLimit = parsePositiveInt(req.query.limit);

  const page = parsedPage ?? env.defaultListPage;
  const limit = Math.min(parsedLimit ?? env.defaultListPageSize, env.maxListPageSize);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}
