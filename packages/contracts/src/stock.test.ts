import { describe, expect, it } from "vitest";
import {
  isStockHistoryRange,
  parseSearchStockResult,
  parseStockHistory,
  parseStockHistoryPoint,
  parseStockQuote,
  parseStockQuotesBatchResponse,
  STOCK_HISTORY_RANGES,
} from "./stock.js";

describe("stock parsers", () => {
  it("accepts supported history ranges", () => {
    for (const range of STOCK_HISTORY_RANGES) {
      expect(isStockHistoryRange(range)).toBe(true);
    }
    expect(isStockHistoryRange("2Y")).toBe(false);
    expect(isStockHistoryRange("YTD")).toBe(true);
  });

  it("parses a valid stock quote", () => {
    const quote = parseStockQuote({
      symbol: "MSFT",
      name: "Microsoft",
      price: 420.5,
      peRatio: 35.2,
      sector: "Technology",
    });

    expect(quote).toEqual({
      symbol: "MSFT",
      name: "Microsoft",
      price: 420.5,
      peRatio: 35.2,
      sector: "Technology",
    });
  });

  it("rejects malformed OHLCV bars", () => {
    expect(parseStockHistoryPoint({ time: "2024-01-01", open: 1, high: 2, low: 0.5 })).toBeNull();
  });

  it("parses stock history with daily and intraday bars", () => {
    const history = parseStockHistory({
      symbol: "TSLA",
      interval: "1day",
      range: "1M",
      points: [
        { time: "2024-06-01", open: 180, high: 185, low: 178, close: 182, volume: 1000 },
        { time: 1717200000, open: 181, high: 186, low: 179, close: 184, volume: 500 },
      ],
    });

    expect(history?.points).toHaveLength(2);
    expect(history?.range).toBe("1M");
  });

  it("parses a stock search result", () => {
    const result = parseSearchStockResult({
      quote: {
        symbol: "AAPL",
        name: "Apple",
        price: 190,
        peRatio: 28,
        sector: "Technology",
      },
      recommendation: "BUY",
      signalId: "sig-1",
    });

    expect(result?.signalId).toBe("sig-1");
    expect(result?.quote.symbol).toBe("AAPL");
  });

  it("parses a batch stock quotes response", () => {
    const response = parseStockQuotesBatchResponse({
      quotes: [
        {
          symbol: "AAPL",
          name: "Apple",
          price: 190,
          peRatio: 28,
          sector: "Technology",
        },
      ],
    });

    expect(response?.quotes).toHaveLength(1);
    expect(response?.quotes[0]?.symbol).toBe("AAPL");
  });
});
