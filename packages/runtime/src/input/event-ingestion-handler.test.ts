import { describe, expect, it, vi } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import { InMemoryEventStore } from "../events/event-store.js";
import { RuntimeNotReadyError, RuntimeReadiness } from "../lifecycle/runtime-readiness.js";
import { InMemoryIngestionMetrics } from "../observability/ingestion-metrics.js";
import { createMetricsIngestionObserver } from "../observability/ingestion-observer.js";
import { Runtime } from "../runtime/runtime.js";
import { createRuntimeIngestionHandler } from "./event-ingestion-handler.js";
import { IngestionProcessingError } from "./ingestion-failure.js";

function event(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    id: "evt-1",
    type: "test.event",
    version: 1,
    occurredAt: "2026-09-11T08:00:00.000Z",
    tenantId: "tenant-1",
    payload: { value: 1 },
    ...overrides,
  };
}

describe("createRuntimeIngestionHandler", () => {
  it("returns accepted after runtime processing and event persistence", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    const handler = createRuntimeIngestionHandler(runtime, {
      eventStore: store,
    });

    await expect(handler(event())).resolves.toMatchObject({
      status: "accepted",
      eventId: "evt-1",
    });

    await expect(store.has("evt-1")).resolves.toBe(true);
  });

  it("persists before applying runtime state", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    const readiness = new RuntimeReadiness();
    readiness.markReady();

    const handler = createRuntimeIngestionHandler(runtime, {
      eventStore: store,
      readiness,
    });

    const result = await handler(event());

    expect(result.status).toBe("accepted");
    expect(await store.has("evt-1")).toBe(true);
  });

  it("returns duplicate while still passing the event through runtime deduplication", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    const readiness = new RuntimeReadiness();
    readiness.markReady();

    await store.append(event());

    const ingestSpy = vi.spyOn(runtime, "ingest");
    const handler = createRuntimeIngestionHandler(runtime, {
      eventStore: store,
      readiness,
    });

    const result = await handler(event());

    expect(result.status).toBe("duplicate");
    expect(ingestSpy).toHaveBeenCalledTimes(1);
  });

  it("retries transient runtime persistence failures", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    const append = vi.spyOn(store, "append");
    append
      .mockRejectedValueOnce(new Error("temporary storage failure"))
      .mockImplementationOnce(async () => ({ status: "inserted" }));

    const handler = createRuntimeIngestionHandler(runtime, {
      eventStore: store,
      retryPolicy: {
        maxAttempts: 2,
        delayMs: () => 0,
        classify: () => ({
          retry: true,
          kind: "transient",
          reason: "temporary storage failure",
        }),
      },
    });

    await expect(handler(event())).resolves.toMatchObject({
      status: "accepted",
    });

    expect(append).toHaveBeenCalledTimes(2);
    expect(runtime.eventCount).toBe(1);
  });

  it("returns duplicate when persistence detects a concurrent delivery", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    vi.spyOn(store, "append").mockResolvedValueOnce({ status: "duplicate" });

    const handler = createRuntimeIngestionHandler(runtime, { eventStore: store });

    await expect(handler(event())).resolves.toMatchObject({
      status: "duplicate",
      eventId: "evt-1",
    });

    expect(runtime.eventCount).toBe(1);
  });

  it("blocks ingestion until recovery marks the runtime ready", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    const readiness = new RuntimeReadiness();
    const handler = createRuntimeIngestionHandler(runtime, {
      eventStore: store,
      readiness,
    });

    await expect(handler(event())).rejects.toBeInstanceOf(RuntimeNotReadyError);
    expect(await store.has("evt-1")).toBe(false);

    readiness.markReady();
    await expect(handler(event())).resolves.toMatchObject({
      status: "accepted",
    });
  });

  it("reports failure and metrics after retries are exhausted", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const store = new InMemoryEventStore();
    vi.spyOn(store, "append").mockRejectedValue(
      new IngestionProcessingError("storage unavailable", "transient"),
    );

    const metrics = new InMemoryIngestionMetrics();
    const handler = createRuntimeIngestionHandler(runtime, {
      eventStore: store,
      observer: createMetricsIngestionObserver(metrics),
      retryPolicy: {
        maxAttempts: 2,
        delayMs: () => 0,
        classify: (error) => ({
          retry: error instanceof IngestionProcessingError,
          kind: "transient",
          reason: "storage unavailable",
        }),
      },
    });

    await expect(handler(event())).rejects.toThrow("Event persistence failed");

    expect(metrics.snapshot()).toMatchObject({
      received: 1,
      failed: 1,
      transientFailures: 1,
    });
  });
});
