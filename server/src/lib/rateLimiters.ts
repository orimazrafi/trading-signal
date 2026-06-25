import rateLimit from "express-rate-limit";

const STOCK_RATE_LIMIT_WINDOW_MS = 60_000;
const STOCK_RATE_LIMIT_MAX_REQUESTS = 60;

/** Limits stock quote/history requests that call external price APIs. */
export const stockQuoteRateLimiter = rateLimit({
  windowMs: STOCK_RATE_LIMIT_WINDOW_MS,
  max: STOCK_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many stock requests. Please try again later." },
});
