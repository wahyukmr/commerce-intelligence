import { describe, expect, it } from "vitest";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { CustomerProjection } from "./customer-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

const createCustomerRegisteredEvent = (): CommerceEvent => ({
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
});

describe("CustomerProjection", () => {
  it("creates an empty state", () => {
    const projection = new CustomerProjection();

    expect(projection.createInitialState(context)).toEqual({
      customers: {},
      totalCustomers: 0,
      totalOrders: 0,
      paidOrders: 0,
      lifetimeRevenue: 0,
    });
  });

  it("creates a customer from customer.registered", () => {
    const projection = new CustomerProjection();

    const initial = projection.createInitialState(context);

    const result = projection.apply(initial, createCustomerRegisteredEvent(), context);

    expect(result.totalCustomers).toBe(1);

    expect(result.customers["customer-1"]).toEqual({
      id: "customer-1",
      email: "customer@example.com",
      registeredAt: "2026-08-30T00:00:00.000Z",
      country: "ID",
      source: "organic",
    });
  });

  it("ignores duplicate customer registration", () => {
    const projection = new CustomerProjection();

    const initial = projection.createInitialState(context);

    const event = createCustomerRegisteredEvent();

    const first = projection.apply(initial, event, context);

    const second = projection.apply(first, event, context);

    expect(second.totalCustomers).toBe(1);
  });

  it("tracks order placement", () => {
    const projection = new CustomerProjection();

    const initial = projection.createInitialState(context);

    const event: CommerceEvent = {
      id: "event-2",
      type: COMMERCE_EVENT_TYPES.ORDER_PLACED,
      version: 1,
      occurredAt: "2026-08-30T00:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        orderId: "order-1",
        customerId: "customer-1",
        placedAt: "2026-08-30T00:00:00.000Z",
        currency: "IDR",
        items: [],
        subtotal: 100_000,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 100_000,
      },
    };

    const result = projection.apply(initial, event, context);

    expect(result.totalOrders).toBe(1);
  });

  it("tracks paid revenue", () => {
    const projection = new CustomerProjection();

    const initial = projection.createInitialState(context);

    const event: CommerceEvent = {
      id: "event-3",
      type: COMMERCE_EVENT_TYPES.ORDER_PAID,
      version: 1,
      occurredAt: "2026-08-30T00:00:00.000Z",
      tenantId: "tenant-1",
      payload: {
        orderId: "order-1",
        customerId: "customer-1",
        paidAt: "2026-08-30T00:00:00.000Z",
        currency: "IDR",
        amount: 100_000,
      },
    };

    const result = projection.apply(initial, event, context);

    expect(result.paidOrders).toBe(1);
    expect(result.lifetimeRevenue).toBe(100_000);
  });
});
