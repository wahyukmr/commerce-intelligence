import { describe, expect, it } from "vitest";
import { InMemoryIngestionMetrics } from "./ingestion-metrics.js";
import { createMetricsIngestionObserver } from "./ingestion-observer.js";

describe("createMetricsIngestionObserver", () => {
  it("connects ingestion callbacks to metrics", () => {
    const metrics = new InMemoryIngestionMetrics();
    const observer = createMetricsIngestionObserver(metrics);

    observer.onReceived({
      id: "evt-1",
      type: "test.event",
      version: 1,
      occurredAt: "2026-09-11T08:00:00.000Z",
      tenantId: "tenant-1",
      payload: {},
    });

    observer.onCompleted({} as never, {} as never, {
      eventId: "evt-1",
      tenantId: "tenant-1",
      status: "accepted",
      attempts: 1,
      durationMs: 3,
    });

    expect(metrics.snapshot()).toMatchObject({
      received: 1,
      accepted: 1,
    });
  });
});
