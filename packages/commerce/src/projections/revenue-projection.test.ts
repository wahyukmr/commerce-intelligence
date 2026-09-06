import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";

import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { RevenueProjection } from "./revenue-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

const createOrderPaidEvent = (id: string, amount: number, currency = "IDR"): CommerceEvent => ({
  id,
  type: COMMERCE_EVENT_TYPES.ORDER_PAID,
  version: 1,
  occurredAt: "2026-08-30T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: {
    orderId: `order-${id}`,
    customerId: "customer-1",
    paidAt: "2026-08-30T00:00:00.000Z",
    currency,
    amount,
  },
});

const createRefundEvent = (id: string, amount: number, currency = "IDR"): CommerceEvent => ({
  id,
  type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
  version: 1,
  occurredAt: "2026-08-30T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: {
    refundId: `refund-${id}`,
    orderId: "order-1",
    customerId: "customer-1",
    issuedAt: "2026-08-30T00:00:00.000Z",
    currency,
    amount,
    reason: "customer_return",
  },
});

describe("RevenueProjection", () => {
  it("creates an empty revenue state", () => {
    const projection = new RevenueProjection();

    expect(projection.createInitialState(context)).toEqual({
      currency: null,
      paidOrderCount: 0,
      grossRevenue: 0,
      refundCount: 0,
      refundedRevenue: 0,
      netRevenue: 0,
    });
  });

  it("tracks paid orders and gross revenue", () => {
    const projection = new RevenueProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPaidEvent("event-1", 100_000), context);

    state = projection.apply(state, createOrderPaidEvent("event-2", 50_000), context);

    expect(state).toEqual({
      currency: "IDR",
      paidOrderCount: 2,
      grossRevenue: 150_000,
      refundCount: 0,
      refundedRevenue: 0,
      netRevenue: 150_000,
    });
  });

  it("subtracts refunds from net revenue", () => {
    const projection = new RevenueProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPaidEvent("event-1", 100_000), context);

    state = projection.apply(state, createRefundEvent("event-2", 25_000), context);

    expect(state).toEqual({
      currency: "IDR",
      paidOrderCount: 1,
      grossRevenue: 100_000,
      refundCount: 1,
      refundedRevenue: 25_000,
      netRevenue: 75_000,
    });
  });

  it("supports multiple refunds", () => {
    const projection = new RevenueProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPaidEvent("event-1", 100_000), context);

    state = projection.apply(state, createRefundEvent("event-2", 20_000), context);

    state = projection.apply(state, createRefundEvent("event-3", 10_000), context);

    expect(state.refundCount).toBe(2);
    expect(state.refundedRevenue).toBe(30_000);
    expect(state.netRevenue).toBe(70_000);
  });

  it("rejects mixed currencies", () => {
    const projection = new RevenueProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(state, createOrderPaidEvent("event-1", 100_000, "IDR"), context);

    expect(() =>
      projection.apply(state, createOrderPaidEvent("event-2", 100, "USD"), context),
    ).toThrow('Revenue projection received multiple currencies: "IDR" and "USD".');
  });

  it("ignores unrelated commerce events", () => {
    const projection = new RevenueProjection();

    const state = projection.createInitialState(context);

    const event: CommerceEvent = {
      id: "event-1",
      type: COMMERCE_EVENT_TYPES.CUSTOMER_REGISTERED,
      version: 1,
      occurredAt: "2026-08-30T00:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        customerId: "customer-1",
        email: "customer@example.com",
        registeredAt: "2026-08-30T00:00:00.000Z",
        country: "ID",
        source: "organic",
      },
    };

    expect(projection.apply(state, event, context)).toBe(state);
  });
});
