import { type BehavioralEvent, COMMERCE_EVENT_TYPES, validateCommerceEvent } from "@ci/commerce";
import { expect, it } from "vitest";

it("accepts all supported behavioral event types", () => {
  const events: BehavioralEvent[] = [
    {
      id: "session-1",
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
        source: "simulation",
        medium: "organic",
        campaign: null,
      },
    },
    {
      id: "view-1",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:01:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        productId: "product-1",
        viewedAt: "2026-09-01T10:01:00.000Z",
      },
    },
    {
      id: "cart-1",
      type: COMMERCE_EVENT_TYPES.CART_ITEM_ADDED,
      version: 1,
      occurredAt: "2026-09-01T10:02:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        productId: "product-1",
        quantity: 1,
        addedAt: "2026-09-01T10:02:00.000Z",
      },
    },
    {
      id: "checkout-1",
      type: COMMERCE_EVENT_TYPES.CHECKOUT_STARTED,
      version: 1,
      occurredAt: "2026-09-01T10:03:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        startedAt: "2026-09-01T10:03:00.000Z",
        itemCount: 1,
        merchandiseValue: 100_000,
        currency: "IDR",
      },
    },
  ];

  for (const event of events) {
    expect(validateCommerceEvent(event)).toEqual({
      valid: true,
      errors: [],
    });
  }
});
