export interface CustomerAnalytics {
  readonly customerId: string;
  readonly firstPurchaseAt: string | null;
  readonly lastPurchaseAt: string | null;
  readonly paidOrderCount: number;
  readonly lifetimeRevenue: number;
  readonly refundedRevenue: number;
  readonly netRevenue: number;
  readonly repeatPurchaseCount: number;
  readonly averageOrderValue: number;
}

export interface CustomerAnalyticsProjectionState {
  readonly currency: string | null;
  readonly customers: Readonly<Record<string, CustomerAnalytics>>;
  readonly customersWithPurchase: number;
}
