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

  it("throws when symbol is empty", () => {
    expect(() => parseCreateAlertFields({ symbol: "  ", thresholdPercent: 5 })).toThrow(AlertError);
  });
});

describe("buildMaxActiveAlertsMessage", () => {
  it("adds removal hint when re-arming at capacity", () => {
    expect(buildMaxActiveAlertsMessage({ hintRemoveExisting: true })).toMatch(/Remove or disable one first/);
  });
});
