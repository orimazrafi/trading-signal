/** Stock row linked to a custom watchlist view. */
export type WatchlistStock = {
  signalId: string;
  symbol: string;
  recommendation: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  createdAt: Date;
};

/** Watchlist view with linked stocks for service and HTTP layers. */
export type WatchlistWithStocks = {
  id: string;
  name: string;
  createdAt: Date;
  stocks: WatchlistStock[];
};
