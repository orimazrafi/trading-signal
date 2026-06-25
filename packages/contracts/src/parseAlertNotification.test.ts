import { describe, expect, it } from "vitest";
import {
  parseAlertNotificationEvent,
  parseAlertNotificationPubSubPayload,
} from "./alert.js";

describe("parseAlertNotificationEvent", () => {
  it("returns null for invalid payloads", () => {
    expect(parseAlertNotificationEvent(null)).toBeNull();
    expect(parseAlertNotificationEvent({ symbol: "AAPL" })).toBeNull();
  });

  it("parses a valid notification event", () => {
    const event = parseAlertNotificationEvent({
      id: "n1",
      alertId: "a1",
      symbol: "AAPL",
      changePercent: 2.5,
      price: 150,
      baselinePrice: 146,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    expect(event).toEqual({
      id: "n1",
      alertId: "a1",
      symbol: "AAPL",
      changePercent: 2.5,
      price: 150,
      baselinePrice: 146,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });
});

describe("parseAlertNotificationPubSubPayload", () => {
  it("parses a redis pub/sub payload", () => {
    const payload = parseAlertNotificationPubSubPayload(
      JSON.stringify({
        userId: "user-1",
        id: "n1",
        alertId: "a1",
        symbol: "AAPL",
        changePercent: 1,
        price: 100,
        baselinePrice: 99,
        createdAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    expect(payload?.userId).toBe("user-1");
    expect(payload?.symbol).toBe("AAPL");
  });
});
