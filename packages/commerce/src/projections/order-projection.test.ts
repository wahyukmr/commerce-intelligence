import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { OrderProjection } from "./order-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

const createOrderPlacedEvent = (): CommerceEvent => ({
  id: "event-order-1",
  type: COMMERCE_EVENT_TYPES.ORDER_PLACED,
  version: 1,
  occurredAt: "2026-08-30T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: {
    orderId: "order-1",
    customerId: "customer-1",
    placedAt: "2026-08-30T00:00:00.000Z",
    currency: "IDR",
    items: [
      {
        productId: "product-1",
        quantity: 2,
        unitPrice: 50_000,
      },
    ],
    subtotal: 100_000,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 100_000,
  },
});

describe("OrderProjection", () => {
  it("creates an empty state", () => {
    const projection = new OrderProjection();

    expect(projection.createInitialState(context)).toEqual({
      orders: {},
      totalOrders: 0,
      paidOrders: 0,
      cancelledOrders: 0,
      refundedOrders: 0,
      grossRevenue: 0,
      refundedRevenue: 0,
    });
  });

  it("creates an order from order.placed", () => {
    const projection = new OrderProjection();

    const initial = projection.createInitialState(context);

    const result = projection.apply(initial, createOrderPlacedEvent(), context);

    expect(result.totalOrders).toBe(1);

    expect(result.orders["order-1"]).toMatchObject({
      id: "order-1",
      customerId: "customer-1",
      status: "placed",
      total: 100_000,
    });
  });

  it("ignores duplicate order placement", () => {
    const projection = new OrderProjection();

    const initial = projection.createInitialState(context);

    const event = createOrderPlacedEvent();

    const first = projection.apply(initial, event, context);

    const second = projection.apply(first, event, context);

    expect(second.totalOrders).toBe(1);
  });

  it("marks an order as paid", () => {
    const projection = new OrderProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPlacedEvent(), context);

    const paidEvent: CommerceEvent = {
      id: "event-paid-1",
      type: COMMERCE_EVENT_TYPES.ORDER_PAID,
      version: 1,
      occurredAt: "2026-08-30T00:01:00.000Z",
      tenantId: "tenant-1",
      payload: {
        orderId: "order-1",
        customerId: "customer-1",
        paidAt: "2026-08-30T00:01:00.000Z",
        currency: "IDR",
        amount: 100_000,
      },
    };

    const result = projection.apply(state, paidEvent, context);

    expect(result.paidOrders).toBe(1);
    expect(result.grossRevenue).toBe(100_000);
    expect(result.orders["order-1"]?.status).toBe("paid");
  });

  it("marks an order as cancelled", () => {
    const projection = new OrderProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPlacedEvent(), context);

    const cancelEvent: CommerceEvent = {
      id: "event-cancel-1",
      type: COMMERCE_EVENT_TYPES.ORDER_CANCELLED,
      version: 1,
      occurredAt: "2026-08-30T00:02:00.000Z",
      tenantId: "tenant-1",
      payload: {
        orderId: "order-1",
        customerId: "customer-1",
        cancelledAt: "2026-08-30T00:02:00.000Z",
        reason: "customer_request",
      },
    };

    const result = projection.apply(state, cancelEvent, context);

    expect(result.cancelledOrders).toBe(1);
    expect(result.orders["order-1"]?.status).toBe("cancelled");
  });

  it("tracks refunds", () => {
    const projection = new OrderProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPlacedEvent(), context);

    const refundEvent: CommerceEvent = {
      id: "event-refund-1",
      type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
      version: 1,
      occurredAt: "2026-08-30T00:03:00.000Z",
      tenantId: "tenant-1",
      payload: {
        refundId: "refund-1",
        orderId: "order-1",
        customerId: "customer-1",
        issuedAt: "2026-08-30T00:03:00.000Z",
        currency: "IDR",
        amount: 50_000,
        reason: "product_return",
      },
    };

    const result = projection.apply(state, refundEvent, context);

    expect(result.refundedOrders).toBe(1);
    expect(result.refundedRevenue).toBe(50_000);
    expect(result.orders["order-1"]?.status).toBe("refunded");
  });
});
