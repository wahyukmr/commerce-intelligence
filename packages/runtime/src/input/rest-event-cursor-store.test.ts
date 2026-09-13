import { describe, expect, it } from "vitest";

import { InMemoryRestEventCursorStore } from "./rest-event-cursor-store.js";

describe("InMemoryRestEventCursorStore", () => {
  it("stores and loads cursors independently by key", async () => {
    const store = new InMemoryRestEventCursorStore();

    await store.save("source-a", "cursor-a");
    await store.save("source-b", "cursor-b");

    await expect(store.load("source-a")).resolves.toBe("cursor-a");
    await expect(store.load("source-b")).resolves.toBe("cursor-b");
  });

  it("clears a cursor", async () => {
    const store = new InMemoryRestEventCursorStore();

    await store.save("source-a", "cursor-a");
    await store.clear("source-a");

    await expect(store.load("source-a")).resolves.toBeUndefined();
  });

  it("rejects invalid save input", async () => {
    const store = new InMemoryRestEventCursorStore();

    await expect(store.save("", "cursor")).rejects.toThrow();
    await expect(store.save("key", "")).rejects.toThrow();
  });
});
