export type FunnelStage =
  | "sessionStarted"
  | "productViewed"
  | "cartItemAdded"
  | "checkoutStarted"
  | "orderPaid";

export interface FunnelSession {
  readonly sessionId: string;
  readonly visitorId: string;
  readonly customerId: string | null;
  readonly sessionStarted: boolean;
  readonly productViewed: boolean;
  readonly cartItemAdded: boolean;
  readonly checkoutStarted: boolean;
  readonly orderPaid: boolean;
}

export interface FunnelCounts {
  readonly sessionStarted: number;
  readonly productViewed: number;
  readonly cartItemAdded: number;
  readonly checkoutStarted: number;
  readonly orderPaid: number;
}

export interface FunnelConversion {
  readonly from: FunnelStage;
  readonly to: FunnelStage;
  readonly countFrom: number;
  readonly countTo: number;
  readonly rate: number;
}

export interface FunnelProjectionState {
  readonly sessions: Readonly<Record<string, FunnelSession>>;
  readonly counts: FunnelCounts;
}
