import { describe, expect, it } from "vitest";
import { canRearmPriceAlert, isActivePriceAlert } from "./priceAlertStatus.js";

describe("isActivePriceAlert", () => {
  it("returns true for enabled alerts that have not fired", () => {
    expect(isActivePriceAlert({ enabled: true, lastTriggeredAt: null })).toBe(true);
  });

  it("returns false for triggered alerts even if enabled flag is stale", () => {
    expect(isActivePriceAlert({ enabled: true, lastTriggeredAt: "2026-01-01T00:00:00.000Z" })).toBe(
      false,
    );
  });

  it("returns false for disabled alerts", () => {
    expect(isActivePriceAlert({ enabled: false, lastTriggeredAt: null })).toBe(false);
  });
});

describe("canRearmPriceAlert", () => {
  it("returns true for triggered alerts", () => {
    expect(
      canRearmPriceAlert({ enabled: false, lastTriggeredAt: "2026-01-01T00:00:00.000Z" }),
    ).toBe(true);
  });

  it("returns false for active alerts", () => {
    expect(canRearmPriceAlert({ enabled: true, lastTriggeredAt: null })).toBe(false);
  });
});
