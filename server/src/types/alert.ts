/** User-configured price alert returned by the API. */
export type PriceAlertView = {
  id: string;
  symbol: string;
  thresholdPercent: number;
  baselinePrice: number;
  enabled: boolean;
  emailEnabled: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Triggered alert notification returned by the API. */
export type AlertNotificationView = {
  id: string;
  alertId: string;
  symbol: string;
  changePercent: number;
  price: number;
  baselinePrice: number;
  emailSent: boolean;
  readAt: string | null;
  createdAt: string;
};

/** Payload published to Redis for SSE clients. */
export type AlertNotificationEvent = {
  id: string;
  alertId: string;
  symbol: string;
  changePercent: number;
  price: number;
  baselinePrice: number;
  createdAt: string;
};

/** Redis pub/sub envelope: notification event plus target user id. */
export type AlertNotificationPubSubPayload = AlertNotificationEvent & {
  userId: string;
};
