import type { EventEnvelope } from "@ci/runtime";

import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { SessionAnalytics } from "../domain/session.js";
import type {
  CartItemAddedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "../events/behavioral-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { SessionBehaviorProjection } from "../projections/session-behavior-projection.js";
import {
  EngagedSessionsQuery,
  SessionAnalyticsQuery,
  SessionAnalyticsSummaryQuery,
} from "./session-analytics.js";

function createSession(
  sessionId: string,
  customerId: string | null,
): EventEnvelope<"session.started", SessionStartedPayload> {
  return {
    id: `session-${sessionId}`,
    type: COMMERCE_EVENT_TYPES.SESSION_STARTED,
    version: 1,
    occurredAt: "2026-09-01T10:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId,
      visitorId: `visitor-${sessionId}`,
      customerId,
      startedAt: "2026-09-01T10:00:00.000Z",
      landingPage: "/",
      source: "direct",
      medium: null,
      campaign: null,
    },
  };
}

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: "tenant-1",
  });

  runtime.registerProjection(new SessionBehaviorProjection());

  runtime.registerQuery(new SessionAnalyticsQuery());

  runtime.registerQuery(new SessionAnalyticsSummaryQuery());

  runtime.registerQuery(new EngagedSessionsQuery());

  return runtime;
}

describe("SessionAnalyticsQuery", () => {
  it("returns session details", () => {
    const runtime = createRuntime();

    runtime.ingest([createSession("session-1", "customer-1")]);

    const result = runtime.query("commerce.session.analytics", {
      sessionId: "session-1",
    });

    expect(result).toEqual({
      session: {
        sessionId: "session-1",
        visitorId: "visitor-session-1",
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
        source: "direct",
        medium: null,
        campaign: null,
      },
    });
  });

  it("returns null for an unknown session", () => {
    const runtime = createRuntime();

    const result = runtime.query("commerce.session.analytics", {
      sessionId: "unknown",
    });

    expect(result).toEqual({
      session: null,
    });
  });

  it("returns session summary", () => {
    const runtime = createRuntime();

    runtime.ingest([createSession("session-1", "customer-1"), createSession("session-2", null)]);

    const view: EventEnvelope<"product.viewed", ProductViewedPayload> = {
      id: "view-1",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:05:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-session-1",
        customerId: "customer-1",
        productId: "product-1",
        viewedAt: "2026-09-01T10:05:00.000Z",
      },
    };

    const cart: EventEnvelope<"cart.item_added", CartItemAddedPayload> = {
      id: "cart-1",
      type: COMMERCE_EVENT_TYPES.CART_ITEM_ADDED,
      version: 1,
      occurredAt: "2026-09-01T10:06:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-session-1",
        customerId: "customer-1",
        productId: "product-1",
        quantity: 2,
        addedAt: "2026-09-01T10:06:00.000Z",
      },
    };

    runtime.ingest([view, cart]);

    const result = runtime.query("commerce.session.analytics.summary", undefined);

    expect(result).toEqual({
      sessionCount: 2,
      customerSessionCount: 1,
      anonymousSessionCount: 1,
      totalProductViews: 1,
      totalCartItemAdds: 1,
      totalCartQuantityAdded: 2,
      totalCheckoutStarts: 0,
      averageDurationMs: 180_000,
    });
  });

  it("returns only engaged sessions", () => {
    const runtime = createRuntime();

    runtime.ingest([createSession("session-1", "customer-1"), createSession("session-2", null)]);

    const view: EventEnvelope<"product.viewed", ProductViewedPayload> = {
      id: "view-1",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:05:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-session-1",
        customerId: "customer-1",
        productId: "product-1",
        viewedAt: "2026-09-01T10:05:00.000Z",
      },
    };

    runtime.ingest([view]);

    const result = runtime.query<undefined, SessionAnalytics[]>(
      "commerce.session.analytics.engaged",
      undefined,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.sessionId).toBe("session-1");
  });

  it("does not mutate runtime state", () => {
    const runtime = createRuntime();

    runtime.ingest([createSession("session-1", "customer-1"), createSession("session-2", null)]);

    const before = runtime.snapshot();

    runtime.query("commerce.session.analytics.engaged", undefined);

    const after = runtime.snapshot();

    expect(after).toEqual(before);
  });
});
