import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { CustomerAnalyticsProjection } from "../projections/customer-analytics-projection.js";
import type { TopCustomer } from "./customer-analytics.js";
import {
  CustomerAnalyticsQuery,
  CustomerAnalyticsSummaryQuery,
  TopCustomersQuery,
} from "./customer-analytics.js";

function createPaidEvent(
  id: string,
  customerId: string,
  amount: number,
  paidAt: string,
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
      currency: "IDR",
      amount,
    },
  };
}

function createRefundEvent(
  id: string,
  customerId: string,
  amount: number,
  issuedAt: string,
): CommerceEvent {
  return {
    id,
    type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
    version: 1,
    occurredAt: issuedAt,
    tenantId: "tenant-1",
    payload: {
      refundId: `refund-${id}`,
      orderId: `order-${customerId}`,
      customerId,
      issuedAt,
      currency: "IDR",
      amount,
      reason: "customer_return",
    },
  };
}

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: "tenant-1",
  });

  runtime.registerProjection(new CustomerAnalyticsProjection());

  runtime.registerQuery(new CustomerAnalyticsQuery());

  runtime.registerQuery(new CustomerAnalyticsSummaryQuery());

  runtime.registerQuery(new TopCustomersQuery());

  return runtime;
}

describe("CustomerAnalyticsQuery", () => {
  it("returns a customer by id", () => {
    const runtime = createRuntime();

    runtime.ingest([createPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z")]);

    const result = runtime.query("commerce.customer.analytics", {
      customerId: "customer-1",
    });

    expect(result).toEqual({
      customer: {
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
    });
  });

  it("returns null for an unknown customer", () => {
    const runtime = createRuntime();

    const result = runtime.query("commerce.customer.analytics", {
      customerId: "unknown",
    });

    expect(result).toEqual({
      customer: null,
    });
  });

  it("returns aggregated customer analytics", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      createPaidEvent("paid-2", "customer-1", 50_000, "2026-08-03T10:00:00.000Z"),
      createPaidEvent("paid-3", "customer-2", 150_000, "2026-08-02T10:00:00.000Z"),
      createRefundEvent("refund-1", "customer-2", 25_000, "2026-08-04T10:00:00.000Z"),
    ]);

    const result = runtime.query("commerce.customer.analytics.summary", undefined);

    expect(result).toEqual({
      currency: "IDR",
      customersWithPurchase: 2,
      totalPaidOrders: 3,
      totalLifetimeRevenue: 300_000,
      totalRefundedRevenue: 25_000,
      totalNetRevenue: 275_000,
      averageOrderValue: 100_000,
    });
  });

  it("returns top customers ordered by net revenue", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      createPaidEvent("paid-2", "customer-2", 300_000, "2026-08-02T10:00:00.000Z"),
      createPaidEvent("paid-3", "customer-3", 200_000, "2026-08-03T10:00:00.000Z"),
      createRefundEvent("refund-1", "customer-2", 100_000, "2026-08-04T10:00:00.000Z"),
    ]);

    const result = runtime.query("commerce.customer.analytics.top", {
      limit: 3,
    });

    expect(result).toEqual([
      {
        customerId: "customer-2",
        lifetimeRevenue: 300_000,
        netRevenue: 200_000,
        paidOrderCount: 1,
        repeatPurchaseCount: 0,
        averageOrderValue: 300_000,
      },
      {
        customerId: "customer-3",
        lifetimeRevenue: 200_000,
        netRevenue: 200_000,
        paidOrderCount: 1,
        repeatPurchaseCount: 0,
        averageOrderValue: 200_000,
      },
      {
        customerId: "customer-1",
        lifetimeRevenue: 100_000,
        netRevenue: 100_000,
        paidOrderCount: 1,
        repeatPurchaseCount: 0,
        averageOrderValue: 100_000,
      },
    ]);
  });

  it("defaults top customer limit to ten", () => {
    const runtime = createRuntime();

    for (let index = 1; index <= 12; index += 1) {
      runtime.ingest([
        createPaidEvent(
          `paid-${index}`,
          `customer-${index}`,
          index * 10_000,
          `2026-08-${String(index).padStart(2, "0")}T10:00:00.000Z`,
        ),
      ]);
    }

    const result = runtime.query<undefined, TopCustomer[]>(
      "commerce.customer.analytics.top",
      undefined,
    );

    expect(result).toHaveLength(10);
    expect(result[0]?.customerId).toBe("customer-12");
    expect(result[9]?.customerId).toBe("customer-3");
  });

  it("does not mutate runtime state", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", "customer-1", 100_000, "2026-08-01T10:00:00.000Z"),
      createPaidEvent("paid-2", "customer-2", 200_000, "2026-08-02T10:00:00.000Z"),
    ]);

    const before = runtime.snapshot();

    runtime.query("commerce.customer.analytics.top", {
      limit: 1,
    });

    const after = runtime.snapshot();

    expect(after).toEqual(before);
  });

  it("throws when the projection is missing", () => {
    const query = new CustomerAnalyticsQuery();

    const snapshot = {
      runtimeVersion: 1 as const,
      sequence: 0,
      eventCount: 0,
      tenantIds: [],
      processedEventIds: [],
      projections: [],
    };

    expect(() =>
      query.execute(
        snapshot,
        {
          customerId: "customer-1",
        },
        {
          tenantId: "tenant-1",
        },
      ),
    ).toThrow('Required projection "commerce.customer-analytics" is not available.');
  });
});
