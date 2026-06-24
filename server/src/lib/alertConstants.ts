/** Maximum active price alerts per user. */
export const MAX_ALERTS_PER_USER = 3;

/** Minimum allowed alert threshold percent. */
export const ALERT_MIN_THRESHOLD_PERCENT = 0.5;

/** Maximum allowed alert threshold percent. */
export const ALERT_MAX_THRESHOLD_PERCENT = 50;

/** Redis pub/sub channel for real-time alert notifications. */
export const ALERT_REDIS_CHANNEL = "alert:notifications";

/** Redis key prefix for cached stock quotes. */
export const STOCK_QUOTE_CACHE_PREFIX = "stock:price:";
