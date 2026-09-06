import type { EventEnvelope } from "@ci/runtime";

import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { OrderPaidPayload } from "../events/commerce-event.js";
import { RetentionProjection } from "../projections/retention-projection.js";
import { RetentionCohortQuery, RetentionSummaryQuery } from "./retention.js";

function createPaidEvent(
  id: string,
  customerId: string,
  paidAt: string,
): EventEnvelope<"order.paid", OrderPaidPayload> {
  return {
    id,
    type: "order.paid",
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

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: "tenant-1",
  });

  runtime.registerProjection(new RetentionProjection());

  runtime.registerQuery(new RetentionCohortQuery());

  runtime.registerQuery(new RetentionSummaryQuery());

  return runtime;
}

describe("RetentionCohortQuery", () => {
  it("returns a cohort", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      createPaidEvent("paid-2", "customer-1", "2026-09-10T10:00:00.000Z"),
    ]);

    const result = runtime.query("commerce.retention.cohort", {
      cohortWeek: "2026-08-31T00:00:00.000Z",
    });

    expect(result).toEqual({
      cohortWeek: "2026-08-31T00:00:00.000Z",
      customerCount: 1,
      periods: [
        {
          week: 0,
          activeCustomerCount: 1,
          retentionRate: 1,
        },
        {
          week: 1,
          activeCustomerCount: 1,
          retentionRate: 1,
        },
      ],
    });
  });

  it("returns null for an unknown cohort", () => {
    const runtime = createRuntime();

    const result = runtime.query("commerce.retention.cohort", {
      cohortWeek: "2026-08-31T00:00:00.000Z",
    });

    expect(result).toBeNull();
  });

  it("returns all cohorts in chronological order", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", "customer-1", "2026-09-10T10:00:00.000Z"),
      createPaidEvent("paid-2", "customer-2", "2026-09-03T10:00:00.000Z"),
    ]);

    const result = runtime.query("commerce.retention.summary", undefined);

    expect(result).toEqual({
      cohortCount: 2,
      customerCount: 2,
      cohorts: [
        {
          cohortWeek: "2026-08-31T00:00:00.000Z",
          customerCount: 1,
          periods: [
            {
              week: 0,
              activeCustomerCount: 1,
              retentionRate: 1,
            },
          ],
        },
        {
          cohortWeek: "2026-09-07T00:00:00.000Z",
          customerCount: 1,
          periods: [
            {
              week: 0,
              activeCustomerCount: 1,
              retentionRate: 1,
            },
          ],
        },
      ],
    });
  });

  it("does not mutate runtime state", () => {
    const runtime = createRuntime();

    runtime.ingest([
      createPaidEvent("paid-1", "customer-1", "2026-09-03T10:00:00.000Z"),
      createPaidEvent("paid-2", "customer-1", "2026-09-10T10:00:00.000Z"),
    ]);

    const before = runtime.snapshot();

    runtime.query("commerce.retention.summary", undefined);

    runtime.query("commerce.retention.cohort", {
      cohortWeek: "2026-08-31T00:00:00.000Z",
    });

    const after = runtime.snapshot();

    expect(after).toEqual(before);
  });

  it("throws when retention projection is missing", () => {
    const query = new RetentionSummaryQuery();

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
    ).toThrow('Required projection "commerce.retention" is not available.');
  });
});
