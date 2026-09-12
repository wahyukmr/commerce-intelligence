import type { EventEnvelope, Projection, ProjectionContext } from "@ci/runtime";
import type { FunnelProjectionState, FunnelSession } from "../domain/funnel";

import type {
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "../events/behavioral-event";

import type { OrderPaidPayload } from "../events/commerce-event";
import { COMMERCE_EVENT_TYPES } from "../events/event-types";

type FunnelEvent =
  | EventEnvelope<"session.started", SessionStartedPayload>
  | EventEnvelope<"product.viewed", ProductViewedPayload>
  | EventEnvelope<"cart.item_added", CartItemAddedPayload>
  | EventEnvelope<"checkout.started", CheckoutStartedPayload>
  | EventEnvelope<"order.paid", OrderPaidPayload>;

export class FunnelProjection implements Projection<FunnelProjectionState> {
  readonly name = "commerce.funnel";

  createInitialState(_context: ProjectionContext): FunnelProjectionState {
    return {
      sessions: {},
      counts: {
        sessionStarted: 0,
        productViewed: 0,
        cartItemAdded: 0,
        checkoutStarted: 0,
        orderPaid: 0,
      },
    };
  }

  apply(
    state: FunnelProjectionState,
    event: FunnelEvent,
    _context: ProjectionContext,
  ): FunnelProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.SESSION_STARTED:
        return this.applySessionStarted(state, event);

      case COMMERCE_EVENT_TYPES.PRODUCT_VIEWED:
        return this.applyProductViewed(state, event);

      case COMMERCE_EVENT_TYPES.CART_ITEM_ADDED:
        return this.applyCartItemAdded(state, event);

      case COMMERCE_EVENT_TYPES.CHECKOUT_STARTED:
        return this.applyCheckoutStarted(state, event);

      case COMMERCE_EVENT_TYPES.ORDER_PAID:
        return this.applyOrderPaid(state, event);

      default:
        return state;
    }
  }

  serialize(state: FunnelProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): FunnelProjectionState {
    return snapshot as FunnelProjectionState;
  }

  private applySessionStarted(
    state: FunnelProjectionState,
    event: Extract<
      FunnelEvent,
      {
        type: "session.started";
      }
    >,
  ): FunnelProjectionState {
    if (state.sessions[event.payload.sessionId]) {
      return state;
    }

    const session: FunnelSession = {
      sessionId: event.payload.sessionId,
      visitorId: event.payload.visitorId,
      customerId: event.payload.customerId,
      sessionStarted: true,
      productViewed: false,
      cartItemAdded: false,
      checkoutStarted: false,
      orderPaid: false,
    };

    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
      counts: {
        ...state.counts,
        sessionStarted: state.counts.sessionStarted + 1,
      },
    };
  }

  private applyProductViewed(
    state: FunnelProjectionState,
    event: Extract<
      FunnelEvent,
      {
        type: "product.viewed";
      }
    >,
  ): FunnelProjectionState {
    const existing = state.sessions[event.payload.sessionId];

    if (!existing) {
      return state;
    }

    if (existing.productViewed) {
      return state;
    }

    const session: FunnelSession = {
      ...existing,
      productViewed: true,
    };

    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
      counts: {
        ...state.counts,
        productViewed: state.counts.productViewed + 1,
      },
    };
  }

  private applyCartItemAdded(
    state: FunnelProjectionState,
    event: Extract<
      FunnelEvent,
      {
        type: "cart.item_added";
      }
    >,
  ): FunnelProjectionState {
    const existing = state.sessions[event.payload.sessionId];

    if (!existing) {
      return state;
    }

    if (!existing.productViewed || existing.cartItemAdded) {
      return state;
    }

    const session: FunnelSession = {
      ...existing,
      cartItemAdded: true,
    };

    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
      counts: {
        ...state.counts,
        cartItemAdded: state.counts.cartItemAdded + 1,
      },
    };
  }

  private applyCheckoutStarted(
    state: FunnelProjectionState,
    event: Extract<
      FunnelEvent,
      {
        type: "checkout.started";
      }
    >,
  ): FunnelProjectionState {
    const existing = state.sessions[event.payload.sessionId];

    if (!existing) {
      return state;
    }

    if (!existing.cartItemAdded || existing.checkoutStarted) {
      return state;
    }

    const session: FunnelSession = {
      ...existing,
      checkoutStarted: true,
    };

    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
      counts: {
        ...state.counts,
        checkoutStarted: state.counts.checkoutStarted + 1,
      },
    };
  }

  private applyOrderPaid(
    state: FunnelProjectionState,
    event: Extract<
      FunnelEvent,
      {
        type: "order.paid";
      }
    >,
  ): FunnelProjectionState {
    const matchingSessions = Object.values(state.sessions).filter(
      (session) => session.customerId === event.payload.customerId && !session.orderPaid,
    );

    if (matchingSessions.length === 0) {
      return state;
    }

    const eligibleSession = matchingSessions
      .filter((session) => session.checkoutStarted)
      .sort((left, right) => left.sessionId.localeCompare(right.sessionId))[0];

    if (!eligibleSession) {
      return state;
    }

    const session: FunnelSession = {
      ...eligibleSession,
      orderPaid: true,
    };

    return {
      ...state,
      sessions: {
        ...state.sessions,
        [session.sessionId]: session,
      },
      counts: {
        ...state.counts,
        orderPaid: state.counts.orderPaid + 1,
      },
    };
  }
}
