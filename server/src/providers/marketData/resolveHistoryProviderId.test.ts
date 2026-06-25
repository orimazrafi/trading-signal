import { describe, expect, it } from "vitest";
import { resolveHistoryProviderId } from "./resolveHistoryProviderId.js";

describe("resolveHistoryProviderId", () => {
  it("defaults history to yahoo when main provider is finnhub", () => {
    expect(resolveHistoryProviderId("finnhub", undefined)).toBe("yahoo");
  });

  it("uses the main provider when it is not finnhub", () => {
    expect(resolveHistoryProviderId("twelveData", undefined)).toBe("twelveData");
  });

  it("honors MARKET_DATA_HISTORY_PROVIDER override", () => {
    expect(resolveHistoryProviderId("finnhub", "twelveData")).toBe("twelveData");
  });
});
