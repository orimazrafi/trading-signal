import { describe, expect, it } from "vitest";
import { diversifyNewsArticles } from "./diversifyNewsArticles.js";
import type { ProcessedNewsArticle } from "../types/news.js";

function article(symbol: string, headline: string): ProcessedNewsArticle {
  return {
    headline,
    url: `https://example.com/${symbol}-${headline}`,
    source: "Test",
    publishedAt: new Date().toISOString(),
    sentiment: "NEUTRAL",
    symbol,
  };
}

describe("diversifyNewsArticles", () => {
  it("caps headlines per symbol and total count", () => {
    const input = [
      article("AAPL", "one"),
      article("AAPL", "two"),
      article("AAPL", "three"),
      article("AAPL", "four"),
      article("MSFT", "one"),
      article("TSLA", "one"),
    ];

    const result = diversifyNewsArticles(input, 4, 2);

    expect(result.map((item) => `${item.symbol}:${item.headline}`)).toEqual([
      "AAPL:one",
      "AAPL:two",
      "MSFT:one",
      "TSLA:one",
    ]);
  });
});
