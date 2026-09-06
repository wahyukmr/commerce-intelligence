import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { RevenueProjection } from "../projections/revenue-projection.js";
import { RevenueSummaryQuery } from "./revenue.js";

function createPaidEvent(id: string, amount: number): CommerceEvent {
  return {
    id,
    type: COMMERCE_EVENT_TYPES.ORDER_PAID,
    version: 1,
    occurredAt: "2026-08-31T00:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      orderId: `order-${id}`,
      customerId: "customer-1",
      paidAt: "2026-08-31T00:00:00.000Z",
      currency: "IDR",
      amount,
    },
  };
}

function createRefundEvent(id: string, amount: number): CommerceEvent {
  return {
    id,
    type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
    version: 1,
    occurredAt: "2026-08-31T00:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      refundId: `refund-${id}`,
      orderId: "order-1",
      customerId: "customer-1",
      issuedAt: "2026-08-31T00:00:00.000Z",
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

  runtime.registerProjection(new RevenueProjection());

  runtime.registerQuery(new RevenueSummaryQuery());

  return runtime;
}

describe("RevenueSummaryQuery", () => {
  it("returns zero revenue for an empty runtime", () => {
    const runtime = createRuntime();

    const result = runtime.query("commerce.revenue.summary", undefined);

    expect(result).toEqual({
      currency: null,
      paidOrderCount: 0,
      grossRevenue: 0,
      refundCount: 0,
      refundedRevenue: 0,
      netRevenue: 0,
    });
  });

  it("returns revenue summary including refunds", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", 100_000),
      createPaidEvent("paid-2", 50_000),
      createRefundEvent("refund-1", 25_000),
    ]);

    const result = runtime.query("commerce.revenue.summary", undefined);

    expect(result).toEqual({
      currency: "IDR",
      paidOrderCount: 2,
      grossRevenue: 150_000,
      refundCount: 1,
      refundedRevenue: 25_000,
      netRevenue: 125_000,
    });
  });

  it("can exclude refund information", () => {
    const runtime = createRuntime();

    runtime.ingest([createPaidEvent("paid-1", 100_000), createRefundEvent("refund-1", 25_000)]);

    const result = runtime.query("commerce.revenue.summary", {
      includeRefunds: false,
    });

    expect(result).toEqual({
      currency: "IDR",
      paidOrderCount: 1,
      grossRevenue: 100_000,
      refundCount: 0,
      refundedRevenue: 0,
      netRevenue: 100_000,
    });
  });

  it("does not mutate runtime state", () => {
    const runtime = createRuntime();

    runtime.ingest([createPaidEvent("paid-1", 100_000)]);

    const before = runtime.snapshot();

    runtime.query("commerce.revenue.summary", undefined);

    const after = runtime.snapshot();

    expect(after).toEqual(before);
  });

  it("rejects a missing revenue projection", () => {
    const query = new RevenueSummaryQuery();

    const snapshot = {
      runtimeVersion: 1 as const,
      sequence: 0,
      eventCount: 0,
      tenantIds: [],
      processedEventIds: [],
      projections: [],
    };

    expect(() =>
      query.execute(snapshot, undefined, {
        tenantId: "tenant-1",
      }),
    ).toThrow('Required projection "commerce.revenue" is not available.');
  });
});
