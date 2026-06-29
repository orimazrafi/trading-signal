import { describe, expect, it } from "vitest";
import { calculateAlertChangePercent } from "./alertChangePercent.js";

describe("calculateAlertChangePercent", () => {
  it("returns zero when baseline is non-positive", () => {
    expect(calculateAlertChangePercent(0, 100)).toBe(0);
  });

  it("returns positive percent for a gain", () => {
    expect(calculateAlertChangePercent(100, 110)).toBe(10);
  });

  it("returns negative percent for a loss", () => {
    expect(calculateAlertChangePercent(100, 90)).toBe(-10);
  });
});
