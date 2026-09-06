import type { EventEnvelope } from "@ci/runtime";

import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { FunnelProjectionState } from "../domain/funnel.js";
import type {
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "../events/behavioral-event.js";
import { FunnelProjection } from "../projections/funnel-projection.js";
import type { FunnelSummary } from "./funnel.js";
import { FunnelSessionQuery, FunnelSummaryQuery } from "./funnel.js";

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: "tenant-1",
  });

  runtime.registerProjection(new FunnelProjection());

  runtime.registerQuery(new FunnelSummaryQuery());

  runtime.registerQuery(new FunnelSessionQuery());

  return runtime;
}

function sessionStarted(): EventEnvelope<"session.started", SessionStartedPayload> {
  return {
    id: "session-1",
    type: "session.started",
    version: 1,
    occurredAt: "2026-09-02T09:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      startedAt: "2026-09-02T09:00:00.000Z",
      landingPage: "/",
      source: "google",
      medium: "organic",
      campaign: null,
    },
  };
}

function productViewed(): EventEnvelope<"product.viewed", ProductViewedPayload> {
  return {
    id: "view-1",
    type: "product.viewed",
    version: 1,
    occurredAt: "2026-09-02T09:01:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      productId: "product-1",
      viewedAt: "2026-09-02T09:01:00.000Z",
    },
  };
}

function cartAdded(): EventEnvelope<"cart.item_added", CartItemAddedPayload> {
  return {
    id: "cart-1",
    type: "cart.item_added",
    version: 1,
    occurredAt: "2026-09-02T09:02:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      productId: "product-1",
      quantity: 1,
      addedAt: "2026-09-02T09:02:00.000Z",
    },
  };
}

function checkoutStarted(): EventEnvelope<"checkout.started", CheckoutStartedPayload> {
  return {
    id: "checkout-1",
    type: "checkout.started",
    version: 1,
    occurredAt: "2026-09-02T09:03:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      startedAt: "2026-09-02T09:03:00.000Z",
      itemCount: 1,
      merchandiseValue: 100_000,
      currency: "IDR",
    },
  };
}

function orderPaid(id = "paid-1"): EventEnvelope<
  "order.paid",
  {
    readonly orderId: string;
    readonly customerId: string;
    readonly paidAt: string;
    readonly currency: string;
    readonly amount: number;
  }
> {
  return {
    id,
    type: "order.paid",
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

describe("FunnelSummaryQuery", () => {
  it("starts with an empty funnel", () => {
    const runtime = createRuntime();

    const result = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    expect(result).toEqual({
      counts: {
        sessionStarted: 0,
        productViewed: 0,
        cartItemAdded: 0,
        checkoutStarted: 0,
        orderPaid: 0,
      },
      conversions: [
        {
          from: "sessionStarted",
          to: "productViewed",
          countFrom: 0,
          countTo: 0,
          rate: 0,
        },
        {
          from: "productViewed",
          to: "cartItemAdded",
          countFrom: 0,
          countTo: 0,
          rate: 0,
        },
        {
          from: "cartItemAdded",
          to: "checkoutStarted",
          countFrom: 0,
          countTo: 0,
          rate: 0,
        },
        {
          from: "checkoutStarted",
          to: "orderPaid",
          countFrom: 0,
          countTo: 0,
          rate: 0,
        },
      ],
    });
  });

  it("calculates stage counts", () => {
    const runtime = createRuntime();

    runtime.ingest([
      sessionStarted(),
      productViewed(),
      cartAdded(),
      checkoutStarted(),
      orderPaid(),
    ]);

    const result = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    expect(result.counts).toEqual({
      sessionStarted: 1,
      productViewed: 1,
      cartItemAdded: 1,
      checkoutStarted: 1,
      orderPaid: 1,
    });

    expect(result.conversions.map((conversion) => conversion.rate)).toEqual([1, 1, 1, 1]);
  });

  it("does not count cart activity before product view", () => {
    const runtime = createRuntime();

    runtime.ingest([sessionStarted(), cartAdded(), checkoutStarted(), orderPaid()]);

    const result = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    expect(result.counts).toEqual({
      sessionStarted: 1,
      productViewed: 0,
      cartItemAdded: 0,
      checkoutStarted: 0,
      orderPaid: 0,
    });
  });

  it("does not count checkout before cart activity", () => {
    const runtime = createRuntime();

    runtime.ingest([sessionStarted(), productViewed(), checkoutStarted(), orderPaid()]);

    const result = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    expect(result.counts).toEqual({
      sessionStarted: 1,
      productViewed: 1,
      cartItemAdded: 0,
      checkoutStarted: 0,
      orderPaid: 0,
    });
  });

  it("counts each stage only once per session", () => {
    const runtime = createRuntime();

    runtime.ingest([
      sessionStarted(),
      productViewed(),
      productViewed(),
      cartAdded(),
      cartAdded(),
      checkoutStarted(),
      checkoutStarted(),
      orderPaid(),
      orderPaid("paid-2"),
    ]);

    const result = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    expect(result.counts).toEqual({
      sessionStarted: 1,
      productViewed: 1,
      cartItemAdded: 1,
      checkoutStarted: 1,
      orderPaid: 1,
    });
  });

  it("returns session funnel state", () => {
    const runtime = createRuntime();

    runtime.ingest([sessionStarted(), productViewed(), cartAdded()]);

    const result = runtime.query<
      { sessionId: string },
      FunnelProjectionState["sessions"][string] | null
    >("commerce.funnel.session", {
      sessionId: "session-1",
    });

    expect(result).toEqual({
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      sessionStarted: true,
      productViewed: true,
      cartItemAdded: true,
      checkoutStarted: false,
      orderPaid: false,
    });
  });

  it("returns null for unknown sessions", () => {
    const runtime = createRuntime();

    const result = runtime.query<
      { sessionId: string },
      FunnelProjectionState["sessions"][string] | null
    >("commerce.funnel.session", {
      sessionId: "unknown",
    });

    expect(result).toBeNull();
  });

  it("calculates partial conversion rates", () => {
    const runtime = createRuntime();

    runtime.ingest([sessionStarted(), productViewed(), cartAdded()]);

    runtime.ingest([
      {
        ...sessionStarted(),
        id: "session-2",
        payload: {
          ...sessionStarted().payload,
          sessionId: "session-2",
          visitorId: "visitor-2",
          customerId: "customer-2",
        },
      },
      {
        ...sessionStarted(),
        id: "session-3",
        payload: {
          ...sessionStarted().payload,
          sessionId: "session-3",
          visitorId: "visitor-3",
          customerId: "customer-3",
        },
      },
    ]);

    const result = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    expect(result.counts.sessionStarted).toBe(3);

    expect(result.counts.productViewed).toBe(1);

    expect(result.conversions[0]?.rate).toBeCloseTo(1 / 3);

    expect(result.conversions[1]?.rate).toBe(1);
  });

  it("does not mutate runtime state", () => {
    const runtime = createRuntime();

    runtime.ingest([sessionStarted(), productViewed(), cartAdded()]);

    const before = runtime.snapshot();

    runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    runtime.query<{ sessionId: string }, FunnelProjectionState["sessions"][string] | null>(
      "commerce.funnel.session",
      {
        sessionId: "session-1",
      },
    );

    const after = runtime.snapshot();

    expect(after).toEqual(before);
  });
});
