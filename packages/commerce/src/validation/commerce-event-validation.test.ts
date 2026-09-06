import { describe, expect, it } from "vitest";
import type { BehavioralEvent } from "../events/behavioral-event.js";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import {
  assertValidCommerceEvent,
  CommerceEventValidationError,
  validateCommerceEvent,
} from "./commerce-event-validation.js";

function createValidOrderPlacedEvent(): Extract<
  CommerceEvent,
  { type: typeof COMMERCE_EVENT_TYPES.ORDER_PLACED }
> {
  return {
    id: "event-1",
    type: COMMERCE_EVENT_TYPES.ORDER_PLACED,
    version: 1,
    occurredAt: "2026-08-31T10:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      orderId: "order-1",
      customerId: "customer-1",
      placedAt: "2026-08-31T10:00:00.000Z",
      currency: "IDR",
      items: [
        {
          productId: "product-1",
          quantity: 2,
          unitPrice: 50_000,
        },
        {
          productId: "product-2",
          quantity: 1,
          unitPrice: 100_000,
        },
      ],
      subtotal: 200_000,
      discount: 20_000,
      tax: 18_000,
      shipping: 10_000,
      total: 208_000,
    },
  };
}

describe("validateCommerceEvent", () => {
  it("accepts a valid order.placed event", () => {
    const event = createValidOrderPlacedEvent();

    expect(validateCommerceEvent(event)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects an empty event id", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      id: "",
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Event id must not be empty.");
  });

  it("rejects an invalid event version", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      version: 0,
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Event version must be a positive integer.");
  });

  it("rejects an invalid tenant id", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      tenantId: " ",
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Event tenantId must not be empty.");
  });

  it("rejects an invalid timestamp", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      occurredAt: "not-a-date",
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Event occurredAt must be a valid ISO-8601 UTC timestamp.");
  });

  it("rejects an order without items", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      payload: {
        ...createValidOrderPlacedEvent().payload,
        items: [],
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Order must contain at least one item.");
  });

  it("rejects duplicated product ids", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      payload: {
        ...createValidOrderPlacedEvent().payload,
        items: [
          {
            productId: "product-1",
            quantity: 1,
            unitPrice: 50_000,
          },
          {
            productId: "product-1",
            quantity: 2,
            unitPrice: 75_000,
          },
        ],
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product "product-1" occurs more than once in the same order.');
  });

  it("rejects invalid quantity", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      payload: {
        ...createValidOrderPlacedEvent().payload,
        items: [
          {
            productId: "product-1",
            quantity: 0,
            unitPrice: 50_000,
          },
        ],
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Order item quantity must be a positive integer.");
  });

  it("rejects invalid currency", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      payload: {
        ...createValidOrderPlacedEvent().payload,
        currency: "idr",
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Currency must be a three-letter uppercase ISO currency code.");
  });

  it("rejects subtotal inconsistent with items", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      payload: {
        ...createValidOrderPlacedEvent().payload,
        subtotal: 999_999,
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("subtotal must equal the sum of order item values.");
  });

  it("rejects inconsistent total", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      payload: {
        ...createValidOrderPlacedEvent().payload,
        total: 1,
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("total must equal subtotal - discount + tax + shipping.");
  });

  it("rejects invalid paid amount", () => {
    const event: CommerceEvent = {
      id: "event-paid-1",
      type: COMMERCE_EVENT_TYPES.ORDER_PAID,
      version: 1,
      occurredAt: "2026-08-31T10:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        orderId: "order-1",
        customerId: "customer-1",
        paidAt: "2026-08-31T10:00:00.000Z",
        currency: "IDR",
        amount: 0,
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("amount must be a positive finite number.");
  });

  it("rejects invalid customer email", () => {
    const event: CommerceEvent = {
      id: "event-customer-1",
      type: COMMERCE_EVENT_TYPES.CUSTOMER_REGISTERED,
      version: 1,
      occurredAt: "2026-08-31T10:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        customerId: "customer-1",
        email: "invalid",
        registeredAt: "2026-08-31T10:00:00.000Z",
        country: "ID",
        source: "organic",
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Customer email must be valid.");
  });

  it("throws from assertValidCommerceEvent", () => {
    const event = {
      ...createValidOrderPlacedEvent(),
      id: "",
    };

    expect(() => assertValidCommerceEvent(event)).toThrow(CommerceEventValidationError);
  });

  it("accepts valid refund events", () => {
    const event: CommerceEvent = {
      id: "refund-event-1",
      type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
      version: 1,
      occurredAt: "2026-08-31T10:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        refundId: "refund-1",
        orderId: "order-1",
        customerId: "customer-1",
        issuedAt: "2026-08-31T10:00:00.000Z",
        currency: "IDR",
        amount: 25_000,
        reason: "customer_return",
      },
    };

    expect(validateCommerceEvent(event)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("accepts a valid session.started event", () => {
    const event: BehavioralEvent = {
      id: "session-event-1",
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

    expect(validateCommerceEvent(event)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects an invalid behavioral session", () => {
    const event: BehavioralEvent = {
      id: "session-event-1",
      type: COMMERCE_EVENT_TYPES.SESSION_STARTED,
      version: 1,
      occurredAt: "2026-09-01T10:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "",
        visitorId: "",
        customerId: null,
        startedAt: "invalid",
        landingPage: null,
        source: null,
        medium: null,
        campaign: null,
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("sessionId must not be empty.");

    expect(result.errors).toContain("visitorId must not be empty.");

    expect(result.errors).toContain("startedAt must be a valid ISO-8601 UTC timestamp.");
  });

  it("accepts a valid product.viewed event", () => {
    const event: BehavioralEvent = {
      id: "view-event-1",
      type: COMMERCE_EVENT_TYPES.PRODUCT_VIEWED,
      version: 1,
      occurredAt: "2026-09-01T10:05:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: null,
        productId: "product-1",
        viewedAt: "2026-09-01T10:05:00.000Z",
      },
    };

    expect(validateCommerceEvent(event)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects invalid cart quantity", () => {
    const event: BehavioralEvent = {
      id: "cart-event-1",
      type: COMMERCE_EVENT_TYPES.CART_ITEM_ADDED,
      version: 1,
      occurredAt: "2026-09-01T10:06:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: null,
        productId: "product-1",
        quantity: 0,
        addedAt: "2026-09-01T10:06:00.000Z",
      },
    };

    const result = validateCommerceEvent(event);

    expect(result.valid).toBe(false);

    expect(result.errors).toContain("Cart quantity must be a positive integer.");
  });

  it("accepts a valid checkout.started event", () => {
    const event: BehavioralEvent = {
      id: "checkout-event-1",
      type: COMMERCE_EVENT_TYPES.CHECKOUT_STARTED,
      version: 1,
      occurredAt: "2026-09-01T10:10:00.000Z",
      tenantId: "tenant-1",
      payload: {
        sessionId: "session-1",
        visitorId: "visitor-1",
        customerId: "customer-1",
        startedAt: "2026-09-01T10:10:00.000Z",
        itemCount: 2,
        merchandiseValue: 200_000,
        currency: "IDR",
      },
    };

    expect(validateCommerceEvent(event)).toEqual({
      valid: true,
      errors: [],
    });
  });
});
