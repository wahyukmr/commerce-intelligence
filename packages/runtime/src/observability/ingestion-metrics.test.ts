import { describe, expect, it } from "vitest";
import { InMemoryIngestionMetrics } from "./ingestion-metrics.js";

describe("InMemoryIngestionMetrics", () => {
  it("aggregates ingestion results", () => {
    const metrics = new InMemoryIngestionMetrics();

    metrics.recordReceived();
    metrics.recordReceived();
    metrics.recordCompleted({
      eventId: "evt-1",
      tenantId: "tenant-1",
      status: "accepted",
      attempts: 1,
      durationMs: 10,
    });
    metrics.recordCompleted({
      eventId: "evt-2",
      tenantId: "tenant-1",
      status: "duplicate",
      attempts: 0,
      durationMs: 5,
    });
    metrics.recordFailed(
      {
        eventId: "evt-3",
        tenantId: "tenant-1",
        status: "failed",
        failureKind: "transient",
        attempts: 2,
        durationMs: 20,
      },
      "transient",
    );

    expect(metrics.snapshot()).toEqual({
      received: 2,
      accepted: 1,
      duplicates: 1,
      failed: 1,
      transientFailures: 1,
      permanentFailures: 0,
      totalProcessingTimeMs: 35,
      averageProcessingTimeMs: 35 / 3,
      maxProcessingTimeMs: 20,
    });
  });
});
