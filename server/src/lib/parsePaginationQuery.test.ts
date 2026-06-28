import { describe, expect, it } from "vitest";
import { parsePaginationQuery } from "./parsePaginationQuery.js";

/** Builds a minimal Express request stub for pagination parsing tests. */
function createPaginationRequest(query: Record<string, string>) {
  return { query } as Parameters<typeof parsePaginationQuery>[0];
}

describe("parsePaginationQuery", () => {
  it("defaults to page 1 and limit 20", () => {
    const pagination = parsePaginationQuery(createPaginationRequest({}));

    expect(pagination).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
      take: 20,
    });
  });

  it("maps page and limit to Prisma skip and take", () => {
    const pagination = parsePaginationQuery(
      createPaginationRequest({ page: "3", limit: "10" }),
    );

    expect(pagination).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
      take: 10,
    });
  });

  it("caps limit at the configured maximum", () => {
    const pagination = parsePaginationQuery(
      createPaginationRequest({ page: "1", limit: "500" }),
    );

    expect(pagination.limit).toBe(100);
    expect(pagination.take).toBe(100);
  });
});
