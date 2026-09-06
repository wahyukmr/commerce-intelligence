import type { Query, QueryContext, RuntimeSnapshot } from "@ci/runtime";

import type { SessionAnalytics, SessionBehaviorProjectionState } from "../domain/session.js";

export interface SessionAnalyticsQueryInput {
  readonly sessionId: string;
}

export interface SessionAnalyticsQueryResult {
  readonly session: SessionAnalytics | null;
}

export interface SessionAnalyticsSummary {
  readonly sessionCount: number;
  readonly customerSessionCount: number;
  readonly anonymousSessionCount: number;
  readonly totalProductViews: number;
  readonly totalCartItemAdds: number;
  readonly totalCartQuantityAdded: number;
  readonly totalCheckoutStarts: number;
  readonly averageDurationMs: number;
}

function getSessionState(snapshot: RuntimeSnapshot): SessionBehaviorProjectionState {
  const projection = snapshot.projections.find((item) => item.name === "commerce.session-behavior");

  if (!projection) {
    throw new Error('Required projection "commerce.session-behavior" is not available.');
  }

  return projection.state as SessionBehaviorProjectionState;
}

export class SessionAnalyticsQuery
  implements Query<SessionAnalyticsQueryInput, SessionAnalyticsQueryResult>
{
  readonly name = "commerce.session.analytics";

  execute(
    snapshot: RuntimeSnapshot,
    input: SessionAnalyticsQueryInput,
    _context: QueryContext,
  ): SessionAnalyticsQueryResult {
    const state = getSessionState(snapshot);

    return {
      session: state.sessions[input.sessionId] ?? null,
    };
  }
}

export class SessionAnalyticsSummaryQuery implements Query<undefined, SessionAnalyticsSummary> {
  readonly name = "commerce.session.analytics.summary";

  execute(
    snapshot: RuntimeSnapshot,
    _input: undefined,
    _context: QueryContext,
  ): SessionAnalyticsSummary {
    const state = getSessionState(snapshot);

    const sessions = Object.values(state.sessions);

    const customerSessionCount = sessions.filter((session) => session.customerId !== null).length;

    const totalProductViews = sessions.reduce(
      (total, session) => total + session.productViewCount,
      0,
    );

    const totalCartItemAdds = sessions.reduce(
      (total, session) => total + session.cartItemAddCount,
      0,
    );

    const totalCartQuantityAdded = sessions.reduce(
      (total, session) => total + session.cartQuantityAdded,
      0,
    );

    const totalCheckoutStarts = sessions.reduce(
      (total, session) => total + session.checkoutStartCount,
      0,
    );

    const totalDurationMs = sessions.reduce((total, session) => total + session.durationMs, 0);

    return {
      sessionCount: sessions.length,
      customerSessionCount,
      anonymousSessionCount: sessions.length - customerSessionCount,
      totalProductViews,
      totalCartItemAdds,
      totalCartQuantityAdded,
      totalCheckoutStarts,
      averageDurationMs: sessions.length === 0 ? 0 : totalDurationMs / sessions.length,
    };
  }
}

export class EngagedSessionsQuery implements Query<undefined, readonly SessionAnalytics[]> {
  readonly name = "commerce.session.analytics.engaged";

  execute(
    snapshot: RuntimeSnapshot,
    _input: undefined,
    _context: QueryContext,
  ): readonly SessionAnalytics[] {
    const state = getSessionState(snapshot);

    return Object.values(state.sessions)
      .filter(
        (session) =>
          session.productViewCount > 0 ||
          session.cartItemAddCount > 0 ||
          session.checkoutStartCount > 0,
      )
      .sort((left, right) => {
        const durationDifference = right.durationMs - left.durationMs;

        if (durationDifference !== 0) {
          return durationDifference;
        }

        return left.sessionId.localeCompare(right.sessionId);
      });
  }
}
