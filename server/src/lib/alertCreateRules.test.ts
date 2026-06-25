import { describe, expect, it } from "vitest";
import {
  buildMaxActiveAlertsMessage,
  parseCreateAlertFields,
} from "./alertCreateRules.js";
import { AlertError } from "./alertError.js";

describe("parseCreateAlertFields", () => {
  it("normalizes symbol and threshold", () => {
    expect(
      parseCreateAlertFields({ symbol: " aapl ", thresholdPercent: 5.555 }),
    ).toEqual({
      symbol: "AAPL",
      thresholdPercent: 5.56,
      emailEnabled: true,
    });
  });

  it("normalizes optional baseline price", () => {
    expect(
      parseCreateAlertFields({ symbol: "AAPL", thresholdPercent: 5, baselinePrice: 105.555 }),
    ).toEqual({
      symbol: "AAPL",
      thresholdPercent: 5,
      emailEnabled: true,
      baselinePrice: 105.56,
    });
  });

  it("throws when baseline price is invalid", () => {
    expect(() =>
      parseCreateAlertFields({ symbol: "AAPL", thresholdPercent: 5, baselinePrice: 0 }),
    ).toThrow(AlertError);
  });
});

describe("buildMaxActiveAlertsMessage", () => {
  it("adds removal hint when re-arming at capacity", () => {
    expect(buildMaxActiveAlertsMessage({ hintRemoveExisting: true })).toMatch(/Remove or disable one first/);
  });
});
