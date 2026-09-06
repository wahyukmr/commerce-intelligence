export interface RevenueProjectionState {
  readonly currency: string | null;
  readonly paidOrderCount: number;
  readonly grossRevenue: number;
  readonly refundCount: number;
  readonly refundedRevenue: number;
  readonly netRevenue: number;
}
