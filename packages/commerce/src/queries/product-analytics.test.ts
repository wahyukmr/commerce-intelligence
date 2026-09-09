import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { ProductAnalytics } from "../domain/product.js";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { ProductAnalyticsProjection } from "../projections/product-analytics-projection.js";
import {
  ProductAnalyticsQuery,
  ProductAnalyticsSummaryQuery,
  TopProductsQuery,
} from "./product-analytics.js";

function createOrderPlacedEvent(
  id: string,
  items: readonly {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[],
): CommerceEvent {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return {
    id,
    type: COMMERCE_EVENT_TYPES.ORDER_PLACED,
    version: 1,
    occurredAt: "2026-08-31T10:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      orderId: `order-${id}`,
      customerId: "customer-1",
      placedAt: "2026-08-31T10:00:00.000Z",
      currency: "IDR",
      items,
      subtotal,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: subtotal,
    },
  };
}

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: "tenant-1",
  });

  runtime.registerProjection(new ProductAnalyticsProjection());

  runtime.registerQuery(new ProductAnalyticsQuery());

  runtime.registerQuery(new ProductAnalyticsSummaryQuery());

  runtime.registerQuery(new TopProductsQuery());

  return runtime;
}

describe("ProductAnalyticsQuery", () => {
  it("returns a product by id", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createOrderPlacedEvent("order-1", [
        {
          productId: "product-1",
          quantity: 2,
          unitPrice: 50_000,
        },
      ]),
    ]);

    const result = runtime.query("commerce.product.analytics", {
      productId: "product-1",
    });

    expect(result).toEqual({
      product: {
        productId: "product-1",
        orderCount: 1,
        unitsOrdered: 2,
        merchandiseValue: 100_000,
        averageUnitPrice: 50_000,
      },
    });
  });

  it("returns null for an unknown product", () => {
    const runtime = createRuntime();

    const result = runtime.query("commerce.product.analytics", {
      productId: "unknown",
    });

    expect(result).toEqual({
      product: null,
    });
  });

  it("returns an aggregate product summary", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createOrderPlacedEvent("order-1", [
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
      ]),
    ]);

    const result = runtime.query("commerce.product.analytics.summary", undefined);

    expect(result).toEqual({
      currency: "IDR",
      productCount: 2,
      totalOrderCount: 2,
      totalUnitsOrdered: 3,
      totalMerchandiseValue: 200_000,
      averageUnitPrice: 66_666.66666666667,
    });
  });

  it("returns top products deterministically", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createOrderPlacedEvent("order-1", [
        {
          productId: "product-a",
          quantity: 2,
          unitPrice: 100_000,
        },
        {
          productId: "product-b",
          quantity: 4,
          unitPrice: 50_000,
        },
        {
          productId: "product-c",
          quantity: 1,
          unitPrice: 50_000,
        },
      ]),
    ]);

    const result = runtime.query("commerce.product.analytics.top", {
      limit: 3,
    });

    expect(result).toEqual([
      {
        productId: "product-a",
        orderCount: 1,
        unitsOrdered: 2,
        merchandiseValue: 200_000,
        averageUnitPrice: 100_000,
      },
      {
        productId: "product-b",
        orderCount: 1,
        unitsOrdered: 4,
        merchandiseValue: 200_000,
        averageUnitPrice: 50_000,
      },
      {
        productId: "product-c",
        orderCount: 1,
        unitsOrdered: 1,
        merchandiseValue: 50_000,
        averageUnitPrice: 50_000,
      },
    ]);
  });

  it("defaults the product limit to ten", () => {
    const runtime = createRuntime();

    for (let index = 1; index <= 12; index += 1) {
      runtime.ingest([
        createOrderPlacedEvent(`order-${index}`, [
          {
            productId: `product-${index}`,
            quantity: 1,
            unitPrice: index * 10_000,
          },
        ]),
      ]);
    }

    const result = runtime.query<undefined, ProductAnalytics[]>(
      "commerce.product.analytics.top",
      undefined,
    );

    expect(result).toHaveLength(10);
    expect(result[0]?.productId).toBe("product-12");
    expect(result[9]?.productId).toBe("product-3");
  });

  it("does not mutate runtime state", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createOrderPlacedEvent("order-1", [
        {
          productId: "product-1",
          quantity: 1,
          unitPrice: 100_000,
        },
      ]),
    ]);

    const before = runtime.snapshot();

    runtime.query("commerce.product.analytics.top", {
      limit: 1,
    });

    const after = runtime.snapshot();

    expect(after).toEqual(before);
  });

  it("throws when product projection is missing", () => {
    const query = new ProductAnalyticsQuery();

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
          productId: "product-1",
        },
        {
          tenantId: "tenant-1",
        },
      ),
    ).toThrow('Required projection "commerce.product.analytics" is not available.');
  });
});
