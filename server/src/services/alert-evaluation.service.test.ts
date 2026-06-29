import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlertAlreadyTriggeredError } from "../lib/alertAlreadyTriggeredError.js";
import type { EnabledPriceAlertWithEmail } from "../types/alertDb.js";
import { evaluatePriceAlerts } from "./alert-evaluation.service.js";

const listEnabledAlertsWithUserEmail = vi.fn<() => Promise<EnabledPriceAlertWithEmail[]>>();
const triggerPriceAlert = vi.fn();
const markAlertNotificationEmailSent = vi.fn();
const publishAlertNotification = vi.fn();
const getStockPrice = vi.fn<(symbol: string) => Promise<number>>();
const sendAlertEmail = vi.fn();

vi.mock("../repositories/alert.repository.js", () => ({
  listEnabledAlertsWithUserEmail: (...args: unknown[]) => listEnabledAlertsWithUserEmail(...args),
  triggerPriceAlert: (...args: unknown[]) => triggerPriceAlert(...args),
  markAlertNotificationEmailSent: (...args: unknown[]) => markAlertNotificationEmailSent(...args),
}));

vi.mock("../lib/alertNotificationPublisher.js", () => ({
  publishAlertNotification: (...args: unknown[]) => publishAlertNotification(...args),
}));

vi.mock("./stock-quote.service.js", () => ({
  getStockPrice: (symbol: string) => getStockPrice(symbol),
}));

vi.mock("./email.service.js", () => ({
  sendAlertEmail: (...args: unknown[]) => sendAlertEmail(...args),
}));

/** Tuesday 2026-06-23 15:00 ET — inside regular US market hours. */
const MARKET_OPEN_INSTANT = new Date("2026-06-23T19:00:00.000Z");

/** Saturday 2026-06-27 midday ET — market closed. */
const MARKET_CLOSED_INSTANT = new Date("2026-06-27T16:00:00.000Z");

const sampleAlert: EnabledPriceAlertWithEmail = {
  id: "alert-1",
  userId: "user-1",
  userEmail: "user@example.com",
  symbol: "AAPL",
  thresholdPercent: 2,
  baselinePrice: 100,
  emailEnabled: false,
};

describe("evaluatePriceAlerts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MARKET_OPEN_INSTANT);
    listEnabledAlertsWithUserEmail.mockReset();
    triggerPriceAlert.mockReset();
    markAlertNotificationEmailSent.mockReset();
    publishAlertNotification.mockReset();
    getStockPrice.mockReset();
    sendAlertEmail.mockReset();
    listEnabledAlertsWithUserEmail.mockResolvedValue([]);
    publishAlertNotification.mockResolvedValue(undefined);
    sendAlertEmail.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("skips evaluation when the US market is closed", async () => {
    vi.setSystemTime(MARKET_CLOSED_INSTANT);

    await evaluatePriceAlerts();

    expect(listEnabledAlertsWithUserEmail).not.toHaveBeenCalled();
  });

  it("evaluates alerts when ignoreMarketHours is set", async () => {
    vi.setSystemTime(MARKET_CLOSED_INSTANT);
    listEnabledAlertsWithUserEmail.mockResolvedValue([]);

    await evaluatePriceAlerts({ ignoreMarketHours: true });

    expect(listEnabledAlertsWithUserEmail).toHaveBeenCalledOnce();
  });

  it("does not trigger alerts below the threshold", async () => {
    listEnabledAlertsWithUserEmail.mockResolvedValue([sampleAlert]);
    getStockPrice.mockResolvedValue(101);

    await evaluatePriceAlerts();

    expect(getStockPrice).toHaveBeenCalledWith("AAPL");
    expect(triggerPriceAlert).not.toHaveBeenCalled();
  });

  it("triggers alerts that cross the threshold and publishes SSE events", async () => {
    const notification = {
      id: "notification-1",
      alertId: sampleAlert.id,
      userId: sampleAlert.userId,
      symbol: sampleAlert.symbol,
      changePercent: 5,
      price: 105,
      baselinePrice: sampleAlert.baselinePrice,
      emailSent: false,
      createdAt: new Date("2026-06-23T19:05:00.000Z"),
    };

    listEnabledAlertsWithUserEmail.mockResolvedValue([sampleAlert]);
    getStockPrice.mockResolvedValue(105);
    triggerPriceAlert.mockResolvedValue(notification);

    await evaluatePriceAlerts();

    expect(triggerPriceAlert).toHaveBeenCalledOnce();
    expect(publishAlertNotification).toHaveBeenCalledWith({
      userId: notification.userId,
      id: notification.id,
      alertId: notification.alertId,
      symbol: notification.symbol,
      changePercent: notification.changePercent,
      price: notification.price,
      baselinePrice: notification.baselinePrice,
      createdAt: notification.createdAt.toISOString(),
    });
  });

  it("fetches each symbol only once when multiple alerts share it", async () => {
    const secondAlert: EnabledPriceAlertWithEmail = {
      ...sampleAlert,
      id: "alert-2",
      userId: "user-2",
      userEmail: "other@example.com",
      thresholdPercent: 10,
    };

    listEnabledAlertsWithUserEmail.mockResolvedValue([sampleAlert, secondAlert]);
    getStockPrice.mockResolvedValue(101);

    await evaluatePriceAlerts();

    expect(getStockPrice).toHaveBeenCalledTimes(1);
    expect(getStockPrice).toHaveBeenCalledWith("AAPL");
  });

  it("continues when a concurrent worker already triggered the alert", async () => {
    listEnabledAlertsWithUserEmail.mockResolvedValue([sampleAlert]);
    getStockPrice.mockResolvedValue(110);
    triggerPriceAlert.mockRejectedValue(new AlertAlreadyTriggeredError());

    await expect(evaluatePriceAlerts()).resolves.toBeUndefined();

    expect(publishAlertNotification).not.toHaveBeenCalled();
  });
});
