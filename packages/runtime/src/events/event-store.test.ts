import { describe, expect, it } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import { InMemoryEventStore } from "./event-store.js";

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

const third: EventEnvelope = {
  ...first,
  id: "evt-3",
  tenantId: "tenant-3",
};

describe("InMemoryEventStore", () => {
  it("stores and reads events", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);
    await store.append(second);

    expect(await store.has("evt-1")).toBe(true);
    await expect(store.append(first)).resolves.toEqual({ status: "duplicate" });
    expect(await store.readAll()).toEqual([first, second]);
  });

  it("returns duplicate for duplicate event ids", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);

    await expect(store.append(first)).resolves.toEqual({
      status: "duplicate",
    });
  });

  it("returns ordered pages after a sequence", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);
    await store.append(second);
    await store.append(third);

    const firstReadPage = await store.readPage({ limit: 2 });

    expect(firstReadPage.events.map((item) => item.id)).toEqual(["evt-1", "evt-2"]);
    expect(firstReadPage.nextSequence).toBe(2);

    const secondReadPage = await store.readPage({
      afterSequence: firstReadPage.nextSequence ?? 0,
      limit: 2,
    });

    expect(secondReadPage.events.map((item) => item.id)).toEqual(["evt-3"]);
    expect(secondReadPage.nextSequence).toBe(3);
  });

  it("filters by tenant", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);
    await store.append(second);

    expect(await store.readAll("tenant-1")).toEqual([first]);
  });

  it("does not let tenant filtering disturb global sequence ordering", async () => {
    const store = new InMemoryEventStore();

    await store.append(first);
    await store.append(second);
    await store.append(third);

    const page = await store.readPage({
      tenantId: "tenant-1",
      limit: 10,
    });

    expect(page.events.map((item) => item.id)).toEqual(["evt-1"]);
    expect(page.nextSequence).toBe(1);
  });
});
