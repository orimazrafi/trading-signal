export type CreateWatchlistBody = {
  name: string;
};

export type WatchlistStockBody = {
  symbol: string;
};

/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Parses POST /watchlists body fields from the request. */
export function parseCreateWatchlistBody(body: unknown): CreateWatchlistBody {
  if (!isRecord(body)) {
    return { name: "" };
  }

  return {
    name: typeof body.name === "string" ? body.name : "",
  };
}

/** Parses POST /watchlists/:id/stocks body fields from the request. */
export function parseWatchlistStockBody(body: unknown): WatchlistStockBody {
  if (!isRecord(body)) {
    return { symbol: "" };
  }

  return {
    symbol: typeof body.symbol === "string" ? body.symbol : "",
  };
}
