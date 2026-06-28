import { describe, expect, it } from "vitest";
import {
  parseCreateWatchlistBody,
  parseWatchlistStockBody,
} from "./parseWatchlistBody.js";

describe("parseCreateWatchlistBody", () => {
  it("parses a watchlist name", () => {
    expect(parseCreateWatchlistBody({ name: "Tech" })).toEqual({ name: "Tech" });
  });

  it("returns an empty name for invalid bodies", () => {
    expect(parseCreateWatchlistBody(42)).toEqual({ name: "" });
  });
});

describe("parseWatchlistStockBody", () => {
  it("parses a stock symbol", () => {
    expect(parseWatchlistStockBody({ symbol: "MSFT" })).toEqual({ symbol: "MSFT" });
  });

  it("returns an empty symbol for invalid bodies", () => {
    expect(parseWatchlistStockBody(null)).toEqual({ symbol: "" });
  });
});
