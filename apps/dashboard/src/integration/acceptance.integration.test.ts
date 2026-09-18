import type { Query } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import { DefaultDashboardAnalyticsController, defineDashboardQueryRef } from "../analytics";
import { createDashboardComposition } from "../runtime";

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
    const eventCount = createEventCountQuery();
    const composition = createDashboardComposition({
      tenantId: "tenant-a",
      queries: { revenue: [eventCount] },
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

    const query = defineDashboardQueryRef<undefined, { eventCount: number }>(
      "commerce.revenue.integration.event_count",
    );

    const controller = new DefaultDashboardAnalyticsController(composition.queryService);

    const result = controller.execute(query, undefined);

    expect(result.eventCount).toBe(1);
    expect(composition.queryComposition.all).toEqual([eventCount]);
    expect(composition.queryService.list("revenue")).toEqual([eventCount]);
  });

  it("keeps the runtime and read boundary tied to the same application instance", () => {
    const composition = createDashboardComposition({ tenantId: "tenant-a" });

    expect(composition.queryService.composition).toBe(composition.queryComposition);
    expect(composition.runtime).toBeDefined();
  });

  it("does not expose raw runtime querying from the typed read helper", () => {
    const composition = createDashboardComposition({ tenantId: "tenant-a" });
    const query = defineDashboardQueryRef<undefined, unknown>(
      "commerce.revenue.integration.missing",
    );

    const controller = new DefaultDashboardAnalyticsController(composition.queryService);

    expect(() => controller.execute(query, undefined)).toThrow(/Unknown commerce query/);
  });
});
