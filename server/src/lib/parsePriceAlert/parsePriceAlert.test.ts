import { describe, expect, it } from "vitest";
import {
  parseCreatePriceAlertBody,
  parseUpdatePriceAlertBody,
} from "./parsePriceAlert.js";

describe("parseCreatePriceAlertBody", () => {
  it("parses valid alert fields", () => {
    expect(
      parseCreatePriceAlertBody({
        symbol: "AAPL",
        thresholdPercent: 3,
        emailEnabled: false,
        baselinePrice: 190.5,
      }),
    ).toEqual({
      symbol: "AAPL",
      thresholdPercent: 3,
      emailEnabled: false,
      baselinePrice: 190.5,
    });
  });

  it("returns empty defaults for non-object bodies", () => {
    expect(parseCreatePriceAlertBody(null)).toEqual({
      symbol: "",
      thresholdPercent: Number.NaN,
    });
  });
});

describe("parseUpdatePriceAlertBody", () => {
  it("parses partial updates and resetBaseline flag", () => {
    expect(
      parseUpdatePriceAlertBody({
        thresholdPercent: 5,
        enabled: true,
        resetBaseline: true,
      }),
    ).toEqual({
      thresholdPercent: 5,
      enabled: true,
      emailEnabled: undefined,
      resetBaseline: true,
    });
  });

  it("defaults resetBaseline to false for invalid bodies", () => {
    expect(parseUpdatePriceAlertBody(undefined)).toEqual({ resetBaseline: false });
  });
});
