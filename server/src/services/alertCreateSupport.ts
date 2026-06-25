import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { AlertError } from "../lib/alertError.js";
import { buildMaxActiveAlertsMessage } from "../lib/alertCreateRules.js";
import { countUserPriceAlerts } from "../repositories/alert.repository.js";
import { MAX_ALERTS_PER_USER } from "../lib/alertConstants.js";
import { getStockPrice } from "./stock.service.js";

type ActiveAlertCapacityOptions = {
  hintRemoveExisting?: boolean;
};

/** Loads a live baseline price for a new or re-armed alert. */
export async function fetchAlertBaselinePrice(symbol: string): Promise<number> {
  try {
    return await getStockPrice(symbol);
  } catch {
    throw new AlertError("Unable to fetch a live price for this symbol", HTTP_STATUS.BAD_GATEWAY);
  }
}

/** Throws when the user already has the maximum number of active alerts. */
export async function assertUserHasActiveAlertSlot(
  userId: string,
  options: ActiveAlertCapacityOptions = {},
): Promise<void> {
  const activeAlertCount = await countUserPriceAlerts(userId);

  if (activeAlertCount >= MAX_ALERTS_PER_USER) {
    throw new AlertError(buildMaxActiveAlertsMessage(options), HTTP_STATUS.CONFLICT);
  }
}
