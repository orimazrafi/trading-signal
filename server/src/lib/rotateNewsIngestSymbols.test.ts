import { describe, expect, it } from "vitest";
import { rotateNewsIngestSymbols } from "./rotateNewsIngestSymbols.js";

describe("rotateNewsIngestSymbols", () => {
  it("returns symbols unchanged when rotation index is zero", () => {
    expect(rotateNewsIngestSymbols(["AAPL", "MSFT", "TSLA"], 0)).toEqual([
      "AAPL",
      "MSFT",
      "TSLA",
    ]);
  });

  it("rotates symbols for positive rotation indexes", () => {
    expect(rotateNewsIngestSymbols(["AAPL", "MSFT", "TSLA"], 1)).toEqual([
      "MSFT",
      "TSLA",
      "AAPL",
    ]);
  });

  it("wraps negative rotation indexes", () => {
    expect(rotateNewsIngestSymbols(["AAPL", "MSFT", "TSLA"], -1)).toEqual([
      "TSLA",
      "AAPL",
      "MSFT",
    ]);
  });
});
