export type CreatePriceAlertBody = {
  symbol: string;
  thresholdPercent: number;
  emailEnabled?: boolean;
  baselinePrice?: number;
};

export type UpdatePriceAlertBody = {
  thresholdPercent?: number;
  enabled?: boolean;
  emailEnabled?: boolean;
  resetBaseline: boolean;
};
