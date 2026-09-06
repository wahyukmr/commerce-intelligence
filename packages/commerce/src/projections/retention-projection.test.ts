import type { EventEnvelope } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { OrderPaidPayload } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";
import { RetentionProjection } from "./retention-projection.js";

const context = {
  tenantId: "tenant-1",
  sequence: 1,
};

function createOrderPaid(
  id: string,
  customerId: string,
  paidAt: string,
): EventEnvelope<"order.paid", OrderPaidPayload> {
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
      amount: 100_000,
    },
  };
}

describe("RetentionProjection", () => {
  it("creates an empty state", () => {
    const projection = new RetentionProjection();

    expect(projection.createInitialState(context)).toEqual({
      customers: {},
      cohorts: {},
      customerCount: 0,
    });
  });

  it("creates a cohort from the first purchase", () => {
    const projection = new RetentionProjection();

    const state = projection.apply(
      projection.createInitialState(context),
      createOrderPaid("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      context,
    );

    expect(state.customerCount).toBe(1);

    expect(state.customers["customer-1"]).toEqual({
      customerId: "customer-1",
      firstPurchaseAt: "2026-09-03T10:00:00.000Z",
      cohortWeek: "2026-08-31T00:00:00.000Z",
      activeWeeks: ["2026-08-31T00:00:00.000Z"],
    });

    expect(state.cohorts["2026-08-31T00:00:00.000Z"]).toEqual({
      cohortWeek: "2026-08-31T00:00:00.000Z",
      customerCount: 1,
      activeCustomerCounts: {
        0: 1,
      },
    });
  });

  it("records week-one retention", () => {
    const projection = new RetentionProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaid("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaid("paid-2", "customer-1", "2026-09-10T10:00:00.000Z"),
      context,
    );

    const cohort = state.cohorts["2026-08-31T00:00:00.000Z"];

    expect(cohort).toEqual({
      cohortWeek: "2026-08-31T00:00:00.000Z",
      customerCount: 1,
      activeCustomerCounts: {
        0: 1,
        1: 1,
      },
    });
  });

  it("records retention across multiple weeks", () => {
    const projection = new RetentionProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaid("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaid("paid-2", "customer-1", "2026-09-17T10:00:00.000Z"),
      context,
    );

    const cohort = state.cohorts["2026-08-31T00:00:00.000Z"];

    expect(cohort?.activeCustomerCounts).toEqual({
      0: 1,
      2: 1,
    });
  });

  it("tracks different customers in the same cohort", () => {
    const projection = new RetentionProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaid("paid-1", "customer-1", "2026-09-01T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaid("paid-2", "customer-2", "2026-09-05T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaid("paid-3", "customer-1", "2026-09-10T10:00:00.000Z"),
      context,
    );

    const cohort = state.cohorts["2026-08-31T00:00:00.000Z"];

    expect(cohort).toEqual({
      cohortWeek: "2026-08-31T00:00:00.000Z",
      customerCount: 2,
      activeCustomerCounts: {
        0: 2,
        1: 1,
      },
    });
  });

  it("does not count repeated activity in the same week twice", () => {
    const projection = new RetentionProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaid("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaid("paid-2", "customer-1", "2026-09-04T10:00:00.000Z"),
      context,
    );

    const cohort = state.cohorts["2026-08-31T00:00:00.000Z"];

    expect(cohort?.activeCustomerCounts).toEqual({
      0: 1,
    });
  });

  it("ignores events from before the first purchase", () => {
    const projection = new RetentionProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaid("paid-1", "customer-1", "2026-09-10T10:00:00.000Z"),
      context,
    );

    state = projection.apply(
      state,
      createOrderPaid("paid-2", "customer-1", "2026-09-03T10:00:00.000Z"),
      context,
    );

    expect(state.customers["customer-1"]?.activeWeeks).toEqual(["2026-09-07T00:00:00.000Z"]);
  });

  it("serializes and restores state", () => {
    const projection = new RetentionProjection();

    let state = projection.createInitialState(context);

    state = projection.apply(
      state,
      createOrderPaid("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      context,
    );

    const snapshot = projection.serialize(state);

    const restored = projection.deserialize(snapshot);

    expect(restored).toEqual(state);
  });
});
