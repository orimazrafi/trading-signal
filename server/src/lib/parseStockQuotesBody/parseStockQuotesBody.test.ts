import { describe, expect, it } from "vitest";
import { parseStockQuotesBody } from "./parseStockQuotesBody.js";

describe("parseStockQuotesBody", () => {
  it("normalizes and deduplicates symbols", () => {
    expect(
      parseStockQuotesBody({
        symbols: [" aapl ", "AAPL", "msft", "msft"],
      }),
    ).toEqual({ symbols: ["AAPL", "MSFT"] });
  });

  it("returns empty symbols for invalid body", () => {
    expect(parseStockQuotesBody(null)).toEqual({ symbols: [] });
    expect(parseStockQuotesBody({ symbols: "AAPL" })).toEqual({ symbols: [] });
  });
});
