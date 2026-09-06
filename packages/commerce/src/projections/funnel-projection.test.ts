import type { EventEnvelope } from "@ci/runtime";
import { describe, expect, it } from "vitest";

import type {
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "../events/behavioral-event.js";
import type { OrderPaidPayload } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { FunnelProjection } from "./funnel-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

function createSessionStartedEvent(
  sessionId = "session-1",
  customerId: string | null = "customer-1",
): EventEnvelope<"session.started", SessionStartedPayload> {
  return {
    id: `session-${sessionId}`,
    type: COMMERCE_EVENT_TYPES.SESSION_STARTED,
    version: 1,
    occurredAt: "2026-09-02T09:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId,
      visitorId: "visitor-1",
      customerId,
      startedAt: "2026-09-02T09:00:00.000Z",
      landingPage: "/",
      source: "google",
      medium: "organic",
      campaign: null,
    },
  };
}

function createProductViewedEvent(
  sessionId = "session-1",
): EventEnvelope<"product.viewed", ProductViewedPayload> {
  return {
    id: "view-1",
    type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
    version: 1,
    occurredAt: "2026-09-02T09:01:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId,
      visitorId: "visitor-1",
      customerId: "customer-1",
      productId: "product-1",
      viewedAt: "2026-09-02T09:01:00.000Z",
    },
  };
}

function createCartItemAddedEvent(
  sessionId = "session-1",
): EventEnvelope<"cart.item_added", CartItemAddedPayload> {
  return {
    id: "cart-1",
    type: COMMERCE_EVENT_TYPES.CART_ITEM_ADDED,
    version: 1,
    occurredAt: "2026-09-02T09:02:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId,
      visitorId: "visitor-1",
      customerId: "customer-1",
      productId: "product-1",
      quantity: 1,
      addedAt: "2026-09-02T09:02:00.000Z",
    },
  };
}

function createCheckoutStartedEvent(
  sessionId = "session-1",
): EventEnvelope<"checkout.started", CheckoutStartedPayload> {
  return {
    id: "checkout-1",
    type: COMMERCE_EVENT_TYPES.CHECKOUT_STARTED,
    version: 1,
    occurredAt: "2026-09-02T09:03:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId,
      visitorId: "visitor-1",
      customerId: "customer-1",
      startedAt: "2026-09-02T09:03:00.000Z",
      itemCount: 1,
      merchandiseValue: 100_000,
      currency: "IDR",
    },
  };
}

function createOrderPaidEvent(): EventEnvelope<"order.paid", OrderPaidPayload> {
  return {
    id: "paid-1",
    type: COMMERCE_EVENT_TYPES.ORDER_PAID,
    version: 1,
    occurredAt: "2026-09-02T09:04:00.000Z",
    tenantId: "tenant-1",
    payload: {
      orderId: "order-1",
      customerId: "customer-1",
      paidAt: "2026-09-02T09:04:00.000Z",
      currency: "IDR",
      amount: 100_000,
    },
  };
}

describe("FunnelProjection", () => {
  it("creates an empty initial state", () => {
    const projection = new FunnelProjection();

    expect(projection.createInitialState(context)).toEqual({
      sessions: {},
      counts: {
        sessionStarted: 0,
        productViewed: 0,
        cartItemAdded: 0,
        checkoutStarted: 0,
        orderPaid: 0,
      },
    });
  });

  it("tracks session started", () => {
    const projection = new FunnelProjection();
    const initial = projection.createInitialState(context);

    const result = projection.apply(initial, createSessionStartedEvent(), context);

    expect(result.counts.sessionStarted).toBe(1);
    expect(result.sessions["session-1"]).toEqual({
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      sessionStarted: true,
      productViewed: false,
      cartItemAdded: false,
      checkoutStarted: false,
      orderPaid: false,
    });
  });

  it("tracks product viewed only for an existing session", () => {
    const projection = new FunnelProjection();
    const initial = projection.apply(
      projection.createInitialState(context),
      createSessionStartedEvent(),
      context,
    );

    const result = projection.apply(initial, createProductViewedEvent(), context);

    expect(result.counts.productViewed).toBe(1);
    expect(result.sessions["session-1"]?.productViewed).toBe(true);
  });

  it("ignores cart add before product view", () => {
    const projection = new FunnelProjection();
    const initial = projection.apply(
      projection.createInitialState(context),
      createSessionStartedEvent(),
      context,
    );

    const result = projection.apply(initial, createCartItemAddedEvent(), context);

    expect(result.counts.cartItemAdded).toBe(0);
  });

  it("tracks cart added after product view", () => {
    const projection = new FunnelProjection();

    let state = projection.createInitialState(context);
    state = projection.apply(state, createSessionStartedEvent(), context);
    state = projection.apply(state, createProductViewedEvent(), context);

    const result = projection.apply(state, createCartItemAddedEvent(), context);

    expect(result.counts.cartItemAdded).toBe(1);
    expect(result.sessions["session-1"]?.cartItemAdded).toBe(true);
  });

  it("tracks checkout started after cart item added", () => {
    const projection = new FunnelProjection();

    let state = projection.createInitialState(context);
    state = projection.apply(state, createSessionStartedEvent(), context);
    state = projection.apply(state, createProductViewedEvent(), context);
    state = projection.apply(state, createCartItemAddedEvent(), context);

    const result = projection.apply(state, createCheckoutStartedEvent(), context);

    expect(result.counts.checkoutStarted).toBe(1);
    expect(result.sessions["session-1"]?.checkoutStarted).toBe(true);
  });

  it("marks order paid for the eligible session that reached checkout", () => {
    const projection = new FunnelProjection();

    let state = projection.createInitialState(context);
    state = projection.apply(state, createSessionStartedEvent(), context);
    state = projection.apply(state, createProductViewedEvent(), context);
    state = projection.apply(state, createCartItemAddedEvent(), context);
    state = projection.apply(state, createCheckoutStartedEvent(), context);

    const result = projection.apply(state, createOrderPaidEvent(), context);

    expect(result.counts.orderPaid).toBe(1);
    expect(result.sessions["session-1"]?.orderPaid).toBe(true);
  });

  it("ignores duplicate stage events within same session", () => {
    const projection = new FunnelProjection();

    let state = projection.createInitialState(context);
    state = projection.apply(state, createSessionStartedEvent(), context);
    state = projection.apply(state, createProductViewedEvent(), context);
    state = projection.apply(state, createProductViewedEvent(), context);

    expect(state.counts.productViewed).toBe(1);
  });
});
