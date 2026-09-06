import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";

import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { CustomerAnalyticsProjection } from "./customer-analytics-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

function createOrderPaidEvent(
  id: string,
  customerId: string,
  amount: number,
  paidAt: string,
  currency = "IDR",
): CommerceEvent {
  return {
    id,
    type: COMMERCE_EVENT_TYPES.ORDER_PAID,
    version: 1,
    occurredAt: paidAt,
    tenantId: "tenant-1",
    payload: {
      orderId: `order-${id}`,
      customerId,
      paidAt,
      currency,
      amount,
    },
  };
}

function createRefundEvent(
  id: string,
  customerId: string,
  amount: number,
  issuedAt: string,
  currency = "IDR",
): CommerceEvent {
  return {
    id,
    type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
    version: 1,
    occurredAt: issuedAt,
    tenantId: "tenant-1",
    payload: {
      refundId: `refund-${id}`,
      orderId: "order-1",
      customerId,
      issuedAt,
      currency,
      amount,
      reason: "customer_return",
    },
  };
}

describe("CustomerAnalyticsProjection", () => {
  it("creates an empty state", () => {
    const projection = new CustomerAnalyticsProjection();

    expect(projection.createInitialState(context)).toEqual({
      currency: null,
      customers: {},
      customersWithPurchase: 0,
    });
  });

  it("creates analytics when a customer makes the first purchase", () => {
    const projection = new CustomerAnalyticsProjection();

    const initial = projection.createInitialState(context);

    const result = projection.apply(
      initial,
      createOrderPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      context,
    );

    expect(result).toEqual({
      currency: "IDR",
      customersWithPurchase: 1,
      customers: {
        "customer-1": {
          customerId: "customer-1",
          firstPurchaseAt: "2026-08-01T10:00:00.000Z",
          lastPurchaseAt: "2026-08-01T10:00:00.000Z",
          paidOrderCount: 1,
          lifetimeRevenue: 100_000,
          refundedRevenue: 0,
          netRevenue: 100_000,
          repeatPurchaseCount: 0,
          averageOrderValue: 100_000,
        },
      },
    });
  });

  it("tracks repeat purchases", () => {
    const projection = new CustomerAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-2", "customer-1", 50_000, "2026-08-10T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-3", "customer-1", 150_000, "2026-08-20T10:00:00.000Z"),
      context,
    );

    const customer = state.customers["customer-1"];

    expect(customer).toEqual({
      customerId: "customer-1",
      firstPurchaseAt: "2026-08-01T10:00:00.000Z",
      lastPurchaseAt: "2026-08-20T10:00:00.000Z",
      paidOrderCount: 3,
      lifetimeRevenue: 300_000,
      refundedRevenue: 0,
      netRevenue: 300_000,
      repeatPurchaseCount: 2,
      averageOrderValue: 100_000,
    });

    expect(state.customersWithPurchase).toBe(1);
  });

  it("tracks multiple customers independently", () => {
    const projection = new CustomerAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-2", "customer-2", 200_000, "2026-08-02T10:00:00.000Z"),
      context,
    );

    expect(state.customers["customer-1"]?.lifetimeRevenue).toBe(100_000);

    expect(state.customers["customer-2"]?.lifetimeRevenue).toBe(200_000);

    expect(state.customersWithPurchase).toBe(2);
  });

  it("applies refunds to the correct customer", () => {
    const projection = new CustomerAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-2", "customer-2", 200_000, "2026-08-02T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createRefundEvent("refund-1", "customer-1", 25_000, "2026-08-03T10:00:00.000Z"),
      context,
    );

    expect(state.customers["customer-1"]).toEqual({
      customerId: "customer-1",
      firstPurchaseAt: "2026-08-01T10:00:00.000Z",
      lastPurchaseAt: "2026-08-01T10:00:00.000Z",
      paidOrderCount: 1,
      lifetimeRevenue: 100_000,
      refundedRevenue: 25_000,
      netRevenue: 75_000,
      repeatPurchaseCount: 0,
      averageOrderValue: 100_000,
    });

    expect(state.customers["customer-2"]?.netRevenue).toBe(200_000);
  });

  it("ignores refunds for unknown customers", () => {
    const projection = new CustomerAnalyticsProjection();

    const initial = projection.createInitialState(context);

    const result = projection.apply(
      initial,
      createRefundEvent("refund-1", "unknown-customer", 25_000, "2026-08-03T10:00:00.000Z"),
      context,
    );

    expect(result).toBe(initial);
  });

  it("rejects mixed currencies", () => {
    const projection = new CustomerAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z", "IDR"),
      context,
    );

    expect(() =>
      projection.apply(
        state,
        createOrderPaidEvent("paid-2", "customer-2", 100, "2026-08-02T10:00:00.000Z", "USD"),
        context,
      ),
    ).toThrow('Customer analytics projection received multiple currencies: "IDR" and "USD".');
  });

  it("serializes and restores state", () => {
    const projection = new CustomerAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      context,
    );

    const snapshot = projection.serialize(state);

    const restored = projection.deserialize(snapshot);

    expect(restored).toEqual(state);
  });
});
