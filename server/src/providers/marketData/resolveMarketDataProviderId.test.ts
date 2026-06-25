import { describe, expect, it } from "vitest";
import { resolveMarketDataProviderId } from "./resolveMarketDataProviderId.js";

describe("resolveMarketDataProviderId", () => {
  it("defaults to finnhub when unset", () => {
    expect(resolveMarketDataProviderId(undefined)).toBe("finnhub");
  });

  it("accepts twelveData aliases", () => {
    expect(resolveMarketDataProviderId("twelve_data")).toBe("twelveData");
    expect(resolveMarketDataProviderId("twelve-data")).toBe("twelveData");
  });

  it("rejects unknown providers", () => {
    expect(() => resolveMarketDataProviderId("unknown-vendor")).toThrow(/Unsupported MARKET_DATA_PROVIDER/);
  });
});
