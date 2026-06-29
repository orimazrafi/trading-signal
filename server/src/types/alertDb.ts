/** PriceAlert row shape from PostgreSQL. */
export type PriceAlertRecord = {
  id: string;
  userId: string;
  symbol: string;
  thresholdPercent: number;
  baselinePrice: number;
  enabled: boolean;
  emailEnabled: boolean;
  lastTriggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Enabled price alert loaded for background evaluation with the owner's email. */
export type EnabledPriceAlertWithEmail = {
  id: string;
  userId: string;
  userEmail: string;
  symbol: string;
  thresholdPercent: number;
  baselinePrice: number;
  emailEnabled: boolean;
};

/** AlertNotification row shape from PostgreSQL. */
export type AlertNotificationRecord = {
  id: string;
  alertId: string;
  userId: string;
  symbol: string;
  changePercent: number;
  price: number;
  baselinePrice: number;
  emailSent: boolean;
  readAt: Date | null;
  createdAt: Date;
};

/** Fields that can be updated on an existing price alert. */
export type PriceAlertUpdateFields = Partial<
  Pick<
    PriceAlertRecord,
    "thresholdPercent" | "enabled" | "emailEnabled" | "baselinePrice" | "lastTriggeredAt"
  >
>;

/** Prisma delegates used by the alert repository. */
export type AlertPrismaClient = {
  priceAlert: {
    count(args: { where: { userId: string; enabled: boolean } }): Promise<number>;
    findMany(args: {
      where: { userId: string };
      orderBy: { createdAt: "asc" };
    }): Promise<PriceAlertRecord[]>;
    findFirst(args: {
      where: { id: string; userId: string };
    }): Promise<PriceAlertRecord | null>;
    findUnique(args: {
      where: { userId_symbol: { userId: string; symbol: string } };
    }): Promise<PriceAlertRecord | null>;
    create(args: {
      data: {
        userId: string;
        symbol: string;
        thresholdPercent: number;
        baselinePrice: number;
        emailEnabled: boolean;
      };
    }): Promise<PriceAlertRecord>;
    update(args: {
      where: { id: string };
      data: PriceAlertUpdateFields;
    }): Promise<PriceAlertRecord>;
    delete(args: { where: { id: string } }): Promise<PriceAlertRecord>;
  };
  alertNotification: {
    findMany(args: {
      where: { userId: string };
      orderBy: { createdAt: "desc" };
      take: number;
    }): Promise<AlertNotificationRecord[]>;
    updateMany(args: {
      where: { id: string; userId: string; readAt: null };
      data: { readAt: Date };
    }): Promise<{ count: number }>;
  };
  user: {
    findUnique(args: {
      where: { id: string };
      select: { email: true };
    }): Promise<{ email: string } | null>;
  };
};
