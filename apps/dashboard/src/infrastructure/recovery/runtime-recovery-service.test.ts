import {
  InMemoryEventStore,
  InMemoryRecoveryStateStore,
  Runtime,
  RuntimeReadiness,
} from "@ci/runtime";
import { describe, expect, it } from "vitest";

import { recoverRuntime } from "./runtime-recovery-service";

function createEvent(id: string) {
  return {
    id,
    type: "test.event",
    version: 1,
    occurredAt: "2026-09-13T00:00:00.000Z",
    tenantId: "tenant-1",
    payload: { id },
  };
}

describe("recoverRuntime with recovery state", () => {
  it("creates a checkpoint after every successfully applied page", async () => {
    const store = new InMemoryEventStore();
    await store.append(createEvent("evt-1"));
    await store.append(createEvent("evt-2"));
    await store.append(createEvent("evt-3"));

    const stateStore = new InMemoryRecoveryStateStore();
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const readiness = new RuntimeReadiness();

    const result = await recoverRuntime(runtime, store, {
      pageSize: 2,
      readiness,
      stateStore,
    });

    expect(result.pagesRead).toBe(3);
    expect(result.checkpointedSequence).toBe(3);
    expect(readiness.isReady).toBe(true);

    const state = await stateStore.load("tenant-1");
    expect(state?.sequence).toBe(3);
    expect(state?.snapshot.eventCount).toBe(3);
  });

  it("restores the snapshot and resumes after the checkpoint", async () => {
    const eventStore = new InMemoryEventStore();
    await eventStore.append(createEvent("evt-1"));
    await eventStore.append(createEvent("evt-2"));
    await eventStore.append(createEvent("evt-3"));

    const firstRuntime = new Runtime({ tenantId: "tenant-1" });
    const stateStore = new InMemoryRecoveryStateStore();

    await recoverRuntime(firstRuntime, eventStore, {
      pageSize: 2,
      stateStore,
    });

    const state = await stateStore.load("tenant-1");
    expect(state?.sequence).toBe(3);

    const restartedRuntime = new Runtime({ tenantId: "tenant-1" });
    const restartedReadiness = new RuntimeReadiness();

    const result = await recoverRuntime(restartedRuntime, eventStore, {
      pageSize: 2,
      stateStore,
      readiness: restartedReadiness,
    });

    expect(result.resumedFromSequence).toBe(3);
    expect(result.eventsRead).toBe(0);
    expect(result.eventsApplied).toBe(0);
    expect(restartedRuntime.eventCount).toBe(3);
    expect(restartedReadiness.isReady).toBe(true);
  });

  it("does not save a checkpoint when a page fails before completion", async () => {
    const stateStore = new InMemoryRecoveryStateStore();
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const readiness = new RuntimeReadiness();

    const failingStore = {
      async has() {
        return false;
      },
      async append() {
        return { status: "inserted" as const };
      },
      async readPage() {
        return {
          events: [createEvent("evt-1")],
          nextSequence: 1,
        };
      },
      async readAll() {
        return [];
      },
    };

    await expect(
      recoverRuntime(runtime, failingStore, {
        pageSize: 1,
        stateStore,
        readiness,
        onEvent: async () => {
          throw new Error("processing failure");
        },
      }),
    ).rejects.toThrow("processing failure");

    expect(await stateStore.load("tenant-1")).toBeNull();
    expect(readiness.isReady).toBe(false);
  });
});
