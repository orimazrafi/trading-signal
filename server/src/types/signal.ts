/** Input for creating a persisted user stock signal. */
export type CreateSignalInput = {
  userId: string;
  symbol: string;
  recommendation: string;
  price: number;
  previousPrice: number;
  changePercent: number;
};

/** User stock signal row used inside repositories and services. */
export type SignalRecord = {
  id: string;
  userId: string;
  symbol: string;
  recommendation: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  createdAt: Date;
};
