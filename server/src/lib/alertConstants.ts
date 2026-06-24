import {
  ALERT_MAX_THRESHOLD_PERCENT,
  ALERT_MIN_THRESHOLD_PERCENT,
  MAX_ALERTS_PER_USER,
} from "@trading-signal/contracts/alert.js";

export { ALERT_MAX_THRESHOLD_PERCENT, ALERT_MIN_THRESHOLD_PERCENT, MAX_ALERTS_PER_USER };

/** Redis pub/sub channel for real-time alert notifications. */
export const ALERT_REDIS_CHANNEL = "alert:notifications";

/** Redis key prefix for cached stock quotes. */
export const STOCK_QUOTE_CACHE_PREFIX = "stock:price:";
