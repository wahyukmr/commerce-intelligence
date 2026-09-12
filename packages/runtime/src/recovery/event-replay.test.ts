import { describe, expect, it } from "vitest";

import type { EventEnvelope } from "../contracts/event.js";
import { InMemoryEventStore } from "../events/event-store.js";
import { replayEventStore } from "./event-replay.js";

const event: EventEnvelope = {
  id: "evt-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-11T08:00:00.000Z",
  tenantId: "tenant-1",
  payload: {},
};

describe("replayEventStore", () => {
  it("replays stored events into a runtime", async () => {
    const store = new InMemoryEventStore();
    const runtime = new (await import("../runtime/runtime.js")).Runtime({
      tenantId: "tenant-1",
    });

    await store.append(event);

    const result = await replayEventStore(store, runtime);

    expect(result.eventsRead).toBe(1);
    expect(result.eventsApplied).toBe(1);
    expect(runtime.eventCount).toBe(1);
  });

  it("replays only the selected tenant", async () => {
    const store = new InMemoryEventStore();
    const runtime = new (await import("../runtime/runtime.js")).Runtime({
      tenantId: "tenant-1",
    });

    await store.append(event);
    await store.append({ ...event, id: "evt-2", tenantId: "tenant-2" });

    const result = await replayEventStore(store, runtime, {
      tenantId: "tenant-1",
    });

    expect(result.eventsRead).toBe(1);
    expect(result.eventsApplied).toBe(1);
  });
});
