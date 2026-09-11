import type { EventEnvelope } from "@ci/runtime";
import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import { createDashboardIngestion } from "./create-dashboard-ingestion.js";

const event: EventEnvelope = {
  id: "evt-dashboard-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-10T08:00:00.000Z",
  tenantId: "tenant-1",
  payload: { value: 1 },
};

describe("createDashboardIngestion", () => {
  it("creates the dashboard webhook composition with the provided runtime", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const ingestion = createDashboardIngestion({ runtime });

    ingestion.start();

    const response = await ingestion.handle(
      new Request("https://example.com/webhooks/commerce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      }),
    );

    expect(response.status).toBe(202);
    expect(runtime.eventCount).toBe(1);
  });
});
