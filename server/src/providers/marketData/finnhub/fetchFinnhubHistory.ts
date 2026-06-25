import { HTTP_STATUS } from "@trading-signal/contracts/httpStatus";
import { StockError } from "../../../lib/stockError.js";
import { toStockProviderError } from "../../../lib/stockProviderErrors.js";
import type { StockHistory, StockHistoryRange } from "../../../types/stockHistory.js";
import { finnhubGet } from "./client.js";
import { mapFinnhubCandles } from "./mapFinnhubCandles.js";
import { normalizeSymbol } from "./normalizeSymbol.js";
import { resolveFinnhubCandleParams } from "./resolveCandleParams.js";
import type { FinnhubCandleResponse } from "./types.js";

/** Fetches OHLCV candles for the requested chart range from Finnhub. */
export async function fetchFinnhubHistory(
  symbol: string,
  range: StockHistoryRange,
): Promise<StockHistory> {
  const normalizedSymbol = normalizeSymbol(symbol);
  const { resolution, from, to, interval, isIntraday } = resolveFinnhubCandleParams(range);

  try {
    const data = await finnhubGet<FinnhubCandleResponse>("/stock/candle", {
      symbol: normalizedSymbol,
      resolution,
      from: String(from),
      to: String(to),
    });

    if (data.s !== "ok") {
      throw new StockError(`Finnhub candles unavailable for ${normalizedSymbol}`, HTTP_STATUS.NOT_FOUND);
    }

    const points = mapFinnhubCandles(data, isIntraday);
    if (points.length === 0) {
      throw new StockError(`No history data returned for ${normalizedSymbol}`, HTTP_STATUS.NOT_FOUND);
    }

    return {
      symbol: normalizedSymbol,
      interval,
      range,
      points,
    };
  } catch (error) {
    if (error instanceof StockError) {
      throw error;
    }

    throw toStockProviderError(error, `history for ${normalizedSymbol}`);
  }
}
