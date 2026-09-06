export interface SessionAnalytics {
  readonly sessionId: string;
  readonly visitorId: string;
  readonly customerId: string | null;
  readonly startedAt: string;
  readonly lastActivityAt: string;
  readonly endedAt: string | null;
  readonly durationMs: number;
  readonly productViewCount: number;
  readonly cartItemAddCount: number;
  readonly cartQuantityAdded: number;
  readonly checkoutStartCount: number;
  readonly landingPage: string | null;
  readonly source: string | null;
  readonly medium: string | null;
  readonly campaign: string | null;
}

export interface SessionBehaviorProjectionState {
  readonly sessions: Readonly<Record<string, SessionAnalytics>>;
}
