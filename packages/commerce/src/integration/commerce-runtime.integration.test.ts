import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { FunnelProjectionState } from "../domain/funnel.js";
import type { BehavioralEvent } from "../events/behavioral-event.js";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import {
  CustomerAnalyticsProjection,
  CustomerAnalyticsQuery,
  CustomerAnalyticsSummaryQuery,
  CustomerProjection,
  EngagedSessionsQuery,
  FunnelProjection,
  FunnelSessionQuery,
  FunnelSummaryQuery,
  OrderProjection,
  ProductAnalyticsProjection,
  ProductAnalyticsQuery,
  ProductAnalyticsSummaryQuery,
  RetentionCohortQuery,
  RetentionProjection,
  RetentionSummaryQuery,
  RevenueProjection,
  RevenueSummaryQuery,
  SessionAnalyticsQuery,
  SessionAnalyticsSummaryQuery,
  SessionBehaviorProjection,
  TopCustomersQuery,
  TopProductsQuery,
} from "../index.js";
import type {
  CustomerAnalyticsQueryResult,
  CustomerAnalyticsSummary,
} from "../queries/customer-analytics.js";
import type { FunnelSummary } from "../queries/funnel.js";
import type {
  ProductAnalyticsQueryResult,
  ProductAnalyticsSummary,
} from "../queries/product-analytics.js";
import type { RetentionCohortResult, RetentionSummary } from "../queries/retention.js";
import type { RevenueSummary } from "../queries/revenue.js";
import type {
  SessionAnalyticsQueryResult,
  SessionAnalyticsSummary,
} from "../queries/session-analytics.js";

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: "tenant-1",
  });

  runtime.registerProjection(new CustomerProjection());

  runtime.registerProjection(new CustomerAnalyticsProjection());

  runtime.registerProjection(new OrderProjection());

  runtime.registerProjection(new RevenueProjection());

  runtime.registerProjection(new ProductAnalyticsProjection());

  runtime.registerProjection(new SessionBehaviorProjection());

  runtime.registerProjection(new FunnelProjection());

  runtime.registerProjection(new RetentionProjection());

  runtime.registerQuery(new RevenueSummaryQuery());

  runtime.registerQuery(new CustomerAnalyticsQuery());

  runtime.registerQuery(new CustomerAnalyticsSummaryQuery());

  runtime.registerQuery(new TopCustomersQuery());

  runtime.registerQuery(new ProductAnalyticsQuery());

  runtime.registerQuery(new ProductAnalyticsSummaryQuery());

  runtime.registerQuery(new TopProductsQuery());

  runtime.registerQuery(new SessionAnalyticsQuery());

  runtime.registerQuery(new SessionAnalyticsSummaryQuery());

  runtime.registerQuery(new EngagedSessionsQuery());

  runtime.registerQuery(new FunnelSummaryQuery());

  runtime.registerQuery(new FunnelSessionQuery());

  runtime.registerQuery(new RetentionCohortQuery());

  runtime.registerQuery(new RetentionSummaryQuery());

  return runtime;
}

function createCustomerRegistered(): CommerceEvent {
  return {
    id: "event-customer-1",
    type: COMMERCE_EVENT_TYPES.CUSTOMER_REGISTERED,
    version: 1,
    occurredAt: "2026-09-01T09:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      customerId: "customer-1",
      email: "customer@example.com",
      registeredAt: "2026-09-01T09:00:00.000Z",
      country: "ID",
      source: "organic",
    },
  };
}

function createSessionStarted(): BehavioralEvent {
  return {
    id: "event-session-1",
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

function createProductViewed(): BehavioralEvent {
  return {
    id: "event-view-1",
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
  };
}

function createCartAdded(): BehavioralEvent {
  return {
    id: "event-cart-1",
    type: COMMERCE_EVENT_TYPES.CART_ITEM_ADDED,
    version: 1,
    occurredAt: "2026-09-01T10:02:00.000Z",
    tenantId: "tenant-1",
    payload: {
      sessionId: "session-1",
      visitorId: "visitor-1",
      customerId: "customer-1",
      productId: "product-1",
      quantity: 2,
      addedAt: "2026-09-01T10:02:00.000Z",
    },
  };
}

function createCheckoutStarted(): BehavioralEvent {
  return {
    id: "event-checkout-1",
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
  };
}

function createOrderPlaced(): CommerceEvent {
  return {
    id: "event-order-1",
    type: COMMERCE_EVENT_TYPES.ORDER_PLACED,
    version: 1,
    occurredAt: "2026-09-01T10:04:00.000Z",
    tenantId: "tenant-1",
    payload: {
      orderId: "order-1",
      customerId: "customer-1",
      placedAt: "2026-09-01T10:04:00.000Z",
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
  };
}

function createOrderPaid(): CommerceEvent {
  return {
    id: "event-paid-1",
    type: COMMERCE_EVENT_TYPES.ORDER_PAID,
    version: 1,
    occurredAt: "2026-09-01T10:05:00.000Z",
    tenantId: "tenant-1",
    payload: {
      orderId: "order-1",
      customerId: "customer-1",
      paidAt: "2026-09-01T10:05:00.000Z",
      currency: "IDR",
      amount: 100_000,
    },
  };
}

function createRefund(): CommerceEvent {
  return {
    id: "event-refund-1",
    type: COMMERCE_EVENT_TYPES.REFUND_ISSUED,
    version: 1,
    occurredAt: "2026-09-08T10:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      refundId: "refund-1",
      orderId: "order-1",
      customerId: "customer-1",
      issuedAt: "2026-09-08T10:00:00.000Z",
      currency: "IDR",
      amount: 25_000,
      reason: "partial_return",
    },
  };
}

describe("Commerce runtime integration", () => {
  it("runs all commerce projections against one event stream", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createCustomerRegistered(),
      createSessionStarted(),
      createProductViewed(),
      createCartAdded(),
      createCheckoutStarted(),
      createOrderPlaced(),
      createOrderPaid(),
      createRefund(),
    ]);

    expect(runtime.projectionNames).toEqual([
      "commerce.customer",
      "commerce.customer-analytics",
      "commerce.order",
      "commerce.revenue",
      "commerce.product-analytics",
      "commerce.session-behavior",
      "commerce.funnel",
      "commerce.retention",
    ]);

    expect(runtime.sequence).toBe(8);

    expect(runtime.eventCount).toBe(8);
  });

  it("returns consistent revenue results", () => {
    const runtime = createRuntime();

    runtime.ingest([createOrderPlaced(), createOrderPaid(), createRefund()]);

    const result = runtime.query<undefined, RevenueSummary>("commerce.revenue.summary", undefined);

    expect(result).toEqual({
      currency: "IDR",
      paidOrderCount: 1,
      grossRevenue: 100_000,
      refundCount: 1,
      refundedRevenue: 25_000,
      netRevenue: 75_000,
    });
  });

  it("returns consistent customer analytics", () => {
    const runtime = createRuntime();

    runtime.ingest([createCustomerRegistered(), createOrderPaid()]);

    const detail = runtime.query<{ customerId: string }, CustomerAnalyticsQueryResult>(
      "commerce.customer.analytics",
      {
        customerId: "customer-1",
      },
    );

    const summary = runtime.query<undefined, CustomerAnalyticsSummary>(
      "commerce.customer.analytics.summary",
      undefined,
    );

    expect(detail.customer?.lifetimeRevenue).toBe(100_000);

    expect(summary.totalLifetimeRevenue).toBe(100_000);

    expect(summary.customersWithPurchase).toBe(1);
  });

  it("returns consistent product analytics", () => {
    const runtime = createRuntime();

    runtime.ingest([createOrderPlaced()]);

    const detail = runtime.query<{ productId: string }, ProductAnalyticsQueryResult>(
      "commerce.product.analytics",
      {
        productId: "product-1",
      },
    );

    const summary = runtime.query<undefined, ProductAnalyticsSummary>(
      "commerce.product.analytics.summary",
      undefined,
    );

    expect(detail.product?.unitsOrdered).toBe(2);

    expect(summary.totalUnitsOrdered).toBe(2);

    expect(summary.totalMerchandiseValue).toBe(100_000);
  });

  it("returns consistent session analytics", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createSessionStarted(),
      createProductViewed(),
      createCartAdded(),
      createCheckoutStarted(),
    ]);

    const detail = runtime.query<{ sessionId: string }, SessionAnalyticsQueryResult>(
      "commerce.session.analytics",
      {
        sessionId: "session-1",
      },
    );

    const summary = runtime.query<undefined, SessionAnalyticsSummary>(
      "commerce.session.analytics.summary",
      undefined,
    );

    expect(detail.session?.productViewCount).toBe(1);

    expect(detail.session?.cartQuantityAdded).toBe(2);

    expect(detail.session?.checkoutStartCount).toBe(1);

    expect(summary.sessionCount).toBe(1);

    expect(summary.totalProductViews).toBe(1);
  });

  it("returns consistent funnel analytics", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createSessionStarted(),
      createProductViewed(),
      createCartAdded(),
      createCheckoutStarted(),
      createOrderPaid(),
    ]);

    const funnel = runtime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined);

    const session = runtime.query<
      { sessionId: string },
      FunnelProjectionState["sessions"][string] | null
    >("commerce.funnel.session", {
      sessionId: "session-1",
    });

    expect(funnel.counts).toEqual({
      sessionStarted: 1,
      productViewed: 1,
      cartItemAdded: 1,
      checkoutStarted: 1,
      orderPaid: 1,
    });

    expect(funnel.conversions.every((conversion) => conversion.rate === 1)).toBe(true);

    expect(session?.orderPaid).toBe(true);
  });

  it("returns consistent retention analytics", () => {
    const runtime = createRuntime();

    runtime.ingest([createOrderPaid(), createRefund()]);

    const summary = runtime.query<undefined, RetentionSummary>(
      "commerce.retention.summary",
      undefined,
    );

    const cohort = runtime.query<{ cohortWeek: string }, RetentionCohortResult | null>(
      "commerce.retention.cohort",
      {
        cohortWeek: "2026-08-31T00:00:00.000Z",
      },
    );

    expect(summary.customerCount).toBe(1);

    expect(cohort?.customerCount).toBe(1);

    expect(cohort?.periods[0]).toEqual({
      week: 0,
      activeCustomerCount: 1,
      retentionRate: 1,
    });
  });

  it("keeps unrelated projections isolated", () => {
    const runtime = createRuntime();

    runtime.ingest([createCustomerRegistered(), createSessionStarted(), createProductViewed()]);

    const revenue = runtime.query<undefined, RevenueSummary>("commerce.revenue.summary", undefined);

    const products = runtime.query<undefined, ProductAnalyticsSummary>(
      "commerce.product.analytics.summary",
      undefined,
    );

    expect(revenue.paidOrderCount).toBe(0);

    expect(revenue.grossRevenue).toBe(0);

    expect(products.productCount).toBe(0);

    expect(runtime.eventCount).toBe(3);
  });

  it("maintains tenant isolation", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createOrderPaid(),
      {
        ...createOrderPaid(),
        id: "other-tenant-event",
        tenantId: "tenant-2",
      },
    ]);

    expect(runtime.eventCount).toBe(1);

    const result = runtime.query<undefined, RevenueSummary>("commerce.revenue.summary", undefined);

    expect(result.paidOrderCount).toBe(1);

    expect(runtime.snapshot().tenantIds).toEqual(["tenant-1"]);
  });

  it("creates a restorable integration snapshot", () => {
    const firstRuntime = createRuntime();

    firstRuntime.ingest([
      createCustomerRegistered(),
      createSessionStarted(),
      createProductViewed(),
      createCartAdded(),
      createCheckoutStarted(),
      createOrderPlaced(),
      createOrderPaid(),
    ]);

    const snapshot = firstRuntime.snapshot();

    const secondRuntime = createRuntime();

    secondRuntime.restore(snapshot);

    expect(secondRuntime.eventCount).toBe(firstRuntime.eventCount);

    expect(secondRuntime.sequence).toBe(firstRuntime.sequence);

    expect(
      secondRuntime.query<undefined, RevenueSummary>("commerce.revenue.summary", undefined),
    ).toEqual(firstRuntime.query<undefined, RevenueSummary>("commerce.revenue.summary", undefined));

    expect(
      secondRuntime.query<{ customerId: string }, CustomerAnalyticsQueryResult>(
        "commerce.customer.analytics",
        {
          customerId: "customer-1",
        },
      ),
    ).toEqual(
      firstRuntime.query<{ customerId: string }, CustomerAnalyticsQueryResult>(
        "commerce.customer.analytics",
        {
          customerId: "customer-1",
        },
      ),
    );

    expect(
      secondRuntime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined),
    ).toEqual(firstRuntime.query<undefined, FunnelSummary>("commerce.funnel.summary", undefined));
  });
});
