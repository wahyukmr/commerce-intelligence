import type { Query } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import { createDashboardComposition } from "../runtime/create-dashboard-composition";
import { defineDashboardQueryRef } from "../services/dashboard-query-ref";
import { executeDashboardQuery } from "../services/execute-dashboard-query";

function createEventCountQuery(): Query {
  return {
    name: "commerce.revenue.integration.event_count",
    execute(snapshot) {
      return { eventCount: snapshot.sequence };
    },
  } as Query;
}

describe("Acceptance Tests", () => {
  it("uses one application composition from ingestion through typed query execution", () => {
    const query = createEventCountQuery();
    const composition = createDashboardComposition({
      tenantId: "tenant-a",
      queries: { revenue: [query] },
    });

    composition.runtime.ingest([
      {
        id: "event-1",
        type: "customer.registered",
        version: 1,
        occurredAt: "2026-01-01T00:00:00.000Z",
        tenantId: "tenant-a",
        payload: {
          customerId: "customer-1",
          email: "customer@example.com",
          registeredAt: "2026-01-01T00:00:00.000Z",
          country: "ID",
          source: "simulation",
        },
      },
    ]);

    const ref = defineDashboardQueryRef<undefined, { eventCount: number }>(
      "commerce.revenue.integration.event_count",
    );

    const result = executeDashboardQuery(composition.queryService, ref, undefined);

    expect(result.eventCount).toBe(1);
    expect(composition.queryComposition.all).toEqual([query]);
    expect(composition.queryService.list("revenue")).toEqual([query]);
  });

  it("keeps the runtime and read boundary tied to the same application instance", () => {
    const composition = createDashboardComposition({ tenantId: "tenant-a" });

    expect(composition.queryService.composition).toBe(composition.queryComposition);
    expect(composition.runtime).toBeDefined();
  });

  it("does not expose raw runtime querying from the typed read helper", () => {
    const composition = createDashboardComposition({ tenantId: "tenant-a" });
    const service = composition.queryService;
    const ref = defineDashboardQueryRef<undefined, unknown>("commerce.revenue.integration.missing");

    expect(() => executeDashboardQuery(service, ref, undefined)).toThrow(/Unknown commerce query/);
  });
});
