import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";

import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { ProductAnalyticsProjection } from "./product-analytics-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

function createOrderPlacedEvent(
  id: string,
  items: readonly {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[],
  currency = "IDR",
): CommerceEvent {
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
      currency,
      items,
      subtotal: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      discount: 0,
      tax: 0,
      shipping: 0,
      total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    },
  };
}

describe("ProductAnalyticsProjection", () => {
  it("creates an empty state", () => {
    const projection = new ProductAnalyticsProjection();

    expect(projection.createInitialState(context)).toEqual({
      currency: null,
      products: {},
    });
  });

  it("tracks product units and merchandise value", () => {
    const projection = new ProductAnalyticsProjection();

    const state = projection.apply(
      projection.createInitialState(context),
      createOrderPlacedEvent("order-1", [
        {
          productId: "product-1",
          quantity: 2,
          unitPrice: 50_000,
        },
      ]),
      context,
    );

    expect(state.products["product-1"]).toEqual({
      productId: "product-1",
      orderCount: 1,
      unitsOrdered: 2,
      merchandiseValue: 100_000,
      averageUnitPrice: 50_000,
    });

    expect(state.currency).toBe("IDR");
  });

  it("accumulates multiple orders for the same product", () => {
    const projection = new ProductAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPlacedEvent("order-1", [
        {
          productId: "product-1",
          quantity: 2,
          unitPrice: 50_000,
        },
      ]),
      context,
    );

    state = projection.apply(
      state,
      createOrderPlacedEvent("order-2", [
        {
          productId: "product-1",
          quantity: 3,
          unitPrice: 60_000,
        },
      ]),
      context,
    );

    expect(state.products["product-1"]).toEqual({
      productId: "product-1",
      orderCount: 2,
      unitsOrdered: 5,
      merchandiseValue: 280_000,
      averageUnitPrice: 56_000,
    });
  });

  it("tracks different products independently", () => {
    const projection = new ProductAnalyticsProjection();

    const state = projection.apply(
      projection.createInitialState(context),
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
      context,
    );

    expect(state.products["product-1"]).toEqual({
      productId: "product-1",
      orderCount: 1,
      unitsOrdered: 2,
      merchandiseValue: 100_000,
      averageUnitPrice: 50_000,
    });

    expect(state.products["product-2"]).toEqual({
      productId: "product-2",
      orderCount: 1,
      unitsOrdered: 1,
      merchandiseValue: 100_000,
      averageUnitPrice: 100_000,
    });
  });

  it("ignores unrelated events", () => {
    const projection = new ProductAnalyticsProjection();

    const state = projection.createInitialState(context);

    const event: CommerceEvent = {
      id: "customer-event-1",
      type: COMMERCE_EVENT_TYPES.CUSTOMER_REGISTERED,
      version: 1,
      occurredAt: "2026-08-31T10:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        customerId: "customer-1",
        email: "customer@example.com",
        registeredAt: "2026-08-31T10:00:00.000Z",
        country: "ID",
        source: "organic",
      },
    };

    expect(projection.apply(state, event, context)).toBe(state);
  });

  it("rejects mixed currencies", () => {
    const projection = new ProductAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPlacedEvent(
        "order-1",
        [
          {
            productId: "product-1",
            quantity: 1,
            unitPrice: 100_000,
          },
        ],
        "IDR",
      ),
      context,
    );

    expect(() =>
      projection.apply(
        state,
        createOrderPlacedEvent(
          "order-2",
          [
            {
              productId: "product-2",
              quantity: 1,
              unitPrice: 100,
            },
          ],
          "USD",
        ),
        context,
      ),
    ).toThrow('Product analytics projection received multiple currencies: "IDR" and "USD".');
  });

  it("serializes and restores state", () => {
    const projection = new ProductAnalyticsProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPlacedEvent("order-1", [
        {
          productId: "product-1",
          quantity: 2,
          unitPrice: 50_000,
        },
      ]),
      context,
    );

    const snapshot = projection.serialize(state);

    const restored = projection.deserialize(snapshot);

    expect(restored).toEqual(state);
  });
});
