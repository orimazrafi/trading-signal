import type { StockHistoryRange } from "../types/stockHistory.js";
import { isStockHistoryRange } from "../types/stockHistory.js";

export type StockHistoryQuery = {
  range: StockHistoryRange;
};

/** Maps stock history query params to a normalized range value. */
export function parseStockHistoryQuery(query: Record<string, unknown>): StockHistoryQuery {
  const range =
    typeof query.range === "string" && isStockHistoryRange(query.range) ? query.range : "3M";

  return { range };
}
