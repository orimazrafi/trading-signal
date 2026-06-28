import { describe, expect, it } from "vitest";
import { buildPaginationMeta, paginationMetaSchema } from "./pagination.js";

describe("buildPaginationMeta", () => {
  it("sets hasMore when more pages exist", () => {
    expect(buildPaginationMeta(1, 20, 45)).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      hasMore: true,
    });
  });

  it("clears hasMore on the last page", () => {
    expect(buildPaginationMeta(3, 20, 45)).toEqual({
      page: 3,
      limit: 20,
      total: 45,
      hasMore: false,
    });
  });

  it("validates against paginationMetaSchema", () => {
    const meta = buildPaginationMeta(2, 10, 15);

    expect(paginationMetaSchema.safeParse(meta).success).toBe(true);
  });
});
