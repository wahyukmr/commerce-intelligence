import { describe, expect, it } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import { DuplicateEventError, InMemoryEventStore } from "./event-store.js";

const first: EventEnvelope = {
  id: "evt-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-11T08:00:00.000Z",
  tenantId: "tenant-1",
  payload: {},
};

const second: EventEnvelope = {
  ...first,
  id: "evt-2",
  tenantId: "tenant-2",
};

describe("InMemoryEventStore", () => {
  it("stores and reads events", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);
    await store.append(second);

    expect(await store.has("evt-1")).toBe(true);
    expect(await store.readAll()).toEqual([first, second]);
  });

  it("rejects duplicate event ids", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);

    await expect(store.append(first)).rejects.toBeInstanceOf(DuplicateEventError);
  });

  it("filters by tenant", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);
    await store.append(second);

    expect(await store.readAll("tenant-1")).toEqual([first]);
  });
});
