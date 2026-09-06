import type { EventEnvelope, Projection, ProjectionContext } from "@ci/runtime";
import type { SessionAnalytics, SessionBehaviorProjectionState } from "../domain/session.js";

import type {
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "../events/behavioral-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";

type SessionEvent =
  | EventEnvelope<"session.started", SessionStartedPayload>
  | EventEnvelope<"product.viewed", ProductViewedPayload>
  | EventEnvelope<"cart.item_added", CartItemAddedPayload>
  | EventEnvelope<"checkout.started", CheckoutStartedPayload>;

export class SessionBehaviorProjection implements Projection<SessionBehaviorProjectionState> {
  readonly name = "commerce.session-behavior";

  createInitialState(_context: ProjectionContext): SessionBehaviorProjectionState {
    return {
      sessions: {},
    };
  }

  apply(
    state: SessionBehaviorProjectionState,
    event: SessionEvent,
    _context: ProjectionContext,
  ): SessionBehaviorProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.SESSION_STARTED:
        return this.applySessionStarted(state, event);

      case COMMERCE_EVENT_TYPES.PRODUCT_VIEWED:
        return this.applyProductViewed(state, event);

      case COMMERCE_EVENT_TYPES.CART_ITEM_ADDED:
        return this.applyCartItemAdded(state, event);

      case COMMERCE_EVENT_TYPES.CHECKOUT_STARTED:
        return this.applyCheckoutStarted(state, event);

      default:
        return state;
    }
  }

  serialize(state: SessionBehaviorProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): SessionBehaviorProjectionState {
    return snapshot as SessionBehaviorProjectionState;
  }

  private applySessionStarted(
    state: SessionBehaviorProjectionState,
    event: Extract<
      SessionEvent,
      {
        type: "session.started";
      }
    >,
  ): SessionBehaviorProjectionState {
    if (state.sessions[event.payload.sessionId]) {
      return state;
    }

    const session: SessionAnalytics = {
      sessionId: event.payload.sessionId,
      visitorId: event.payload.visitorId,
      customerId: event.payload.customerId,
      startedAt: event.payload.startedAt,
      lastActivityAt: event.payload.startedAt,
      endedAt: null,
      durationMs: 0,
      productViewCount: 0,
      cartItemAddCount: 0,
      cartQuantityAdded: 0,
      checkoutStartCount: 0,
      landingPage: event.payload.landingPage,
      source: event.payload.source,
      medium: event.payload.medium,
      campaign: event.payload.campaign,
    };

    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
    };
  }

  private applyProductViewed(
    state: SessionBehaviorProjectionState,
    event: Extract<
      SessionEvent,
      {
        type: "product.viewed";
      }
    >,
  ): SessionBehaviorProjectionState {
    const existing = state.sessions[event.payload.sessionId];

    if (!existing) {
      return state;
    }

    const updated = this.withActivity(existing, event.payload.viewedAt);

    return this.replaceSession(state, {
      ...updated,
      productViewCount: existing.productViewCount + 1,
    });
  }

  private applyCartItemAdded(
    state: SessionBehaviorProjectionState,
    event: Extract<
      SessionEvent,
      {
        type: "cart.item_added";
      }
    >,
  ): SessionBehaviorProjectionState {
    const existing = state.sessions[event.payload.sessionId];

    if (!existing) {
      return state;
    }

    const updated = this.withActivity(existing, event.payload.addedAt);

    return this.replaceSession(state, {
      ...updated,
      cartItemAddCount: existing.cartItemAddCount + 1,
      cartQuantityAdded: existing.cartQuantityAdded + event.payload.quantity,
    });
  }

  private applyCheckoutStarted(
    state: SessionBehaviorProjectionState,
    event: Extract<
      SessionEvent,
      {
        type: "checkout.started";
      }
    >,
  ): SessionBehaviorProjectionState {
    const existing = state.sessions[event.payload.sessionId];

    if (!existing) {
      return state;
    }

    const updated = this.withActivity(existing, event.payload.startedAt);

    return this.replaceSession(state, {
      ...updated,
      checkoutStartCount: existing.checkoutStartCount + 1,
    });
  }

  private withActivity(session: SessionAnalytics, activityAt: string): SessionAnalytics {
    const activityTimestamp = Date.parse(activityAt);

    const lastTimestamp = Date.parse(session.lastActivityAt);

    const startedTimestamp = Date.parse(session.startedAt);

    if (
      Number.isNaN(activityTimestamp) ||
      Number.isNaN(lastTimestamp) ||
      Number.isNaN(startedTimestamp)
    ) {
      return session;
    }

    const nextLastTimestamp = Math.max(lastTimestamp, activityTimestamp);

    return {
      ...session,
      lastActivityAt: activityTimestamp > lastTimestamp ? activityAt : session.lastActivityAt,
      durationMs: Math.max(nextLastTimestamp - startedTimestamp, 0),
    };
  }

  private replaceSession(
    state: SessionBehaviorProjectionState,
    session: SessionAnalytics,
  ): SessionBehaviorProjectionState {
    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
    };
  }
}
