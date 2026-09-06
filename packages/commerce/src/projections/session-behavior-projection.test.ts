import type { EventEnvelope } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type {
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "../events/behavioral-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { SessionBehaviorProjection } from "./session-behavior-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

function createSessionStarted(
  id = "session-event-1",
): EventEnvelope<"session.started", SessionStartedPayload> {
  return {
    id,
    type: COMMERCE_EVENT_TYPES.SESSION_STARTED,
    version: 1,
    occurredAt: "2026-09-01T10:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      startedAt: "2026-09-01T10:00:00.000Z",
      landingPage: "/",
      source: "google",
      medium: "organic",
      campaign: null,
    },
  };
}

describe("SessionBehaviorProjection", () => {
  it("creates an empty state", () => {
    const projection = new SessionBehaviorProjection();

    expect(projection.createInitialState(context)).toEqual({
      sessions: {},
    });
  });

  it("creates a session", () => {
    const projection = new SessionBehaviorProjection();

    const state = projection.apply(
      projection.createInitialState(context),
      createSessionStarted(),
      context,
    );

    expect(state.sessions["session-1"]).toEqual({
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      startedAt: "2026-09-01T10:00:00.000Z",
      lastActivityAt: "2026-09-01T10:00:00.000Z",
      endedAt: null,
      durationMs: 0,
      productViewCount: 0,
      cartItemAddCount: 0,
      cartQuantityAdded: 0,
      checkoutStartCount: 0,
      landingPage: "/",
      source: "google",
      medium: "organic",
      campaign: null,
    });
  });

  it("ignores duplicate session.started events", () => {
    const projection = new SessionBehaviorProjection();

    let state = projection.createInitialState(context);

    const event = createSessionStarted();

    state = projection.apply(state, event, context);

    state = projection.apply(state, event, context);

    expect(Object.keys(state.sessions)).toHaveLength(1);
  });

  it("tracks product views", () => {
    const projection = new SessionBehaviorProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createSessionStarted(), context);

    const event: EventEnvelope<"product.viewed", ProductViewedPayload> = {
      id: "product-view-1",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:05:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        productId: "product-1",
        viewedAt: "2026-09-01T10:05:00.000Z",
      },
    };

    state = projection.apply(state, event, context);

    expect(state.sessions["session-1"]?.productViewCount).toBe(1);

    expect(state.sessions["session-1"]?.lastActivityAt).toBe("2026-09-01T10:05:00.000Z");

    expect(state.sessions["session-1"]?.durationMs).toBe(300_000);
  });

  it("tracks cart additions and quantity", () => {
    const projection = new SessionBehaviorProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createSessionStarted(), context);

    const first: EventEnvelope<"cart.item_added", CartItemAddedPayload> = {
      id: "cart-add-1",
      type: COMMERCE_EVENT_TYPES.CART_ITEM_ADDED,
      version: 1,
      occurredAt: "2026-09-01T10:06:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        productId: "product-1",
        quantity: 2,
        addedAt: "2026-09-01T10:06:00.000Z",
      },
    };

    const second: EventEnvelope<"cart.item_added", CartItemAddedPayload> = {
      ...first,
      id: "cart-add-2",
      occurredAt: "2026-09-01T10:07:00.000Z",
      payload: {
        ...first.payload,
        quantity: 3,
        addedAt: "2026-09-01T10:07:00.000Z",
      },
    };

    state = projection.apply(state, first, context);

    state = projection.apply(state, second, context);

    expect(state.sessions["session-1"]?.cartItemAddCount).toBe(2);

    expect(state.sessions["session-1"]?.cartQuantityAdded).toBe(5);

    expect(state.sessions["session-1"]?.durationMs).toBe(420_000);
  });

  it("tracks checkout starts", () => {
    const projection = new SessionBehaviorProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createSessionStarted(), context);

    const event: EventEnvelope<"checkout.started", CheckoutStartedPayload> = {
      id: "checkout-1",
      type: COMMERCE_EVENT_TYPES.CHECKOUT_STARTED,
      version: 1,
      occurredAt: "2026-09-01T10:10:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        startedAt: "2026-09-01T10:10:00.000Z",
        itemCount: 3,
        merchandiseValue: 300_000,
        currency: "IDR",
      },
    };

    state = projection.apply(state, event, context);

    expect(state.sessions["session-1"]?.checkoutStartCount).toBe(1);

    expect(state.sessions["session-1"]?.durationMs).toBe(600_000);
  });

  it("does not move last activity backwards", () => {
    const projection = new SessionBehaviorProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createSessionStarted(), context);

    const event: EventEnvelope<"product.viewed", ProductViewedPayload> = {
      id: "product-view-old",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:02:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        productId: "product-1",
        viewedAt: "2026-09-01T10:02:00.000Z",
      },
    };

    const newerEvent: EventEnvelope<"product.viewed", ProductViewedPayload> = {
      ...event,
      id: "product-view-new",
      occurredAt: "2026-09-01T10:08:00.000Z",
      payload: {
        ...event.payload,
        viewedAt: "2026-09-01T10:08:00.000Z",
      },
    };

    state = projection.apply(state, newerEvent, context);

    state = projection.apply(state, event, context);

    expect(state.sessions["session-1"]?.lastActivityAt).toBe("2026-09-01T10:08:00.000Z");

    expect(state.sessions["session-1"]?.durationMs).toBe(480_000);

    expect(state.sessions["session-1"]?.productViewCount).toBe(2);
  });

  it("ignores activity for an unknown session", () => {
    const projection = new SessionBehaviorProjection();

    const state = projection.createInitialState(context);

    const event: EventEnvelope<"product.viewed", ProductViewedPayload> = {
      id: "product-view-unknown",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:05:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "unknown",
        visitorId: "visitor-1",
        customerId: null,
        productId: "product-1",
        viewedAt: "2026-09-01T10:05:00.000Z",
      },
    };

    expect(projection.apply(state, event, context)).toBe(state);
  });

  it("serializes and restores state", () => {
    const projection = new SessionBehaviorProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createSessionStarted(), context);

    const snapshot = projection.serialize(state);

    const restored = projection.deserialize(snapshot);

    expect(restored).toEqual(state);
  });
});
