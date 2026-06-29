import { AlertAlreadyTriggeredError } from "../lib/alertAlreadyTriggeredError.js";
import { calculateAlertChangePercent } from "../lib/alertChangePercent.js";
import { publishAlertNotification } from "../lib/alertNotificationPublisher.js";
import { isUSMarketOpen } from "../lib/market/usMarketHours.js";
import { log } from "../lib/logger/index.js";
import {
  listEnabledAlertsWithUserEmail,
  markAlertNotificationEmailSent,
  triggerPriceAlert,
} from "../repositories/alert.repository.js";
import { sendAlertEmail } from "./email.service.js";
import { getStockPrice } from "./stock-quote.service.js";

export type EvaluatePriceAlertsOptions = {
  ignoreMarketHours?: boolean;
};

let evaluationInProgress = false;

/** Evaluates enabled alerts, triggers threshold crossings, and notifies users. */
export async function evaluatePriceAlerts(
  options: EvaluatePriceAlertsOptions = {},
): Promise<void> {
  if (evaluationInProgress) {
    return;
  }

  evaluationInProgress = true;

  try {
    if (!options.ignoreMarketHours && !isUSMarketOpen(new Date())) {
      return;
    }

    const alerts = await listEnabledAlertsWithUserEmail();

    if (alerts.length === 0) {
      return;
    }

    const priceBySymbol = new Map<string, number>();

    for (const alert of alerts) {
      let currentPrice = priceBySymbol.get(alert.symbol);

      if (currentPrice === undefined) {
        try {
          currentPrice = await getStockPrice(alert.symbol);
          priceBySymbol.set(alert.symbol, currentPrice);
        } catch (error) {
          log.error("Failed to fetch price for alert evaluation", error, { symbol: alert.symbol });
          continue;
        }
      }

      const changePercent = calculateAlertChangePercent(alert.baselinePrice, currentPrice);

      if (Math.abs(changePercent) < alert.thresholdPercent) {
        continue;
      }

      let emailSent = false;

      let notification;

      try {
        notification = await triggerPriceAlert({
          alertId: alert.id,
          userId: alert.userId,
          symbol: alert.symbol,
          changePercent,
          currentPrice,
          baselinePrice: alert.baselinePrice,
          emailSent: false,
        });
      } catch (error) {
        if (error instanceof AlertAlreadyTriggeredError) {
          continue;
        }

        log.error("Failed to persist triggered alert", error, {
          alertId: alert.id,
          symbol: alert.symbol,
        });
        continue;
      }

      try {
        await publishAlertNotification({
          userId: notification.userId,
          id: notification.id,
          alertId: notification.alertId,
          symbol: notification.symbol,
          changePercent: notification.changePercent,
          price: notification.price,
          baselinePrice: notification.baselinePrice,
          createdAt: notification.createdAt.toISOString(),
        });
      } catch (error) {
        log.error("Failed to publish alert notification event", error, {
          alertId: alert.id,
          symbol: alert.symbol,
        });
      }

      if (alert.emailEnabled) {
        emailSent = await sendAlertEmail({
          to: alert.userEmail,
          symbol: alert.symbol,
          changePercent,
          price: currentPrice,
          baselinePrice: alert.baselinePrice,
          thresholdPercent: alert.thresholdPercent,
        });

        if (emailSent) {
          try {
            await markAlertNotificationEmailSent(notification.id);
          } catch (error) {
            log.error("Failed to mark alert notification email as sent", error, {
              notificationId: notification.id,
              symbol: alert.symbol,
            });
          }
        }
      }

      log.info("Triggered price alert", {
        userId: alert.userId,
        symbol: alert.symbol,
        price: currentPrice,
        baselinePrice: alert.baselinePrice,
        thresholdPercent: alert.thresholdPercent,
        changePercent,
        emailSent,
      });
    }
  } finally {
    evaluationInProgress = false;
  }
}
