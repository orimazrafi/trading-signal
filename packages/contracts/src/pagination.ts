import { z } from "zod";

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

/** Pagination metadata returned by list endpoints. */
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** Builds pagination metadata from page, limit, and total row count. */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}
