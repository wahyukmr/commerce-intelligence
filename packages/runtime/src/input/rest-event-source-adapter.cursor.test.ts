import { describe, expect, it, vi } from "vitest";

import type { EventEnvelope } from "../contracts/event.js";
import type { IngestionOutcome } from "./ingestion-outcome.js";
import { InMemoryRestEventCursorStore } from "./rest-event-cursor-store.js";
import { HttpRestEventSourceAdapter } from "./rest-event-source-adapter.js";

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
}

const event: EventEnvelope = {
  id: "evt-1",
  type: "order.paid",
  version: 1,
  occurredAt: "2026-09-12T08:00:00.000Z",
  tenantId: "tenant-1",
  payload: { orderId: "order-1" },
};

const accepted: IngestionOutcome = {
  status: "accepted",
  eventId: event.id,
  tenantId: event.tenantId,
  receivedAt: "2026-09-12T08:00:00.000Z",
};

describe("HttpRestEventSourceAdapter cursor recovery", () => {
  it("loads a persisted cursor before the first pull", async () => {
    const cursorStore = new InMemoryRestEventCursorStore();
    await cursorStore.save("orders", "cursor-41");

    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ events: [], cursor: "cursor-42" }));

    const adapter = new HttpRestEventSourceAdapter<EventEnvelope>({
      endpoint: "https://example.com/events",
      fetch: fetchImpl,
      cursorStore,
      cursorKey: "orders",
      mapper: { map: (value) => value },
    });

    adapter.start(async () => accepted);
    await adapter.pull();

    const requestedUrl = String(fetchImpl.mock.calls[0]?.[0]);
    expect(requestedUrl).toContain("cursor=cursor-41");
    await expect(cursorStore.load("orders")).resolves.toBe("cursor-42");

    adapter.stop();
  });

  it("does not advance the cursor when event delivery fails", async () => {
    const cursorStore = new InMemoryRestEventCursorStore();
    await cursorStore.save("orders", "cursor-41");

    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ events: [event], cursor: "cursor-42" }));

    const adapter = new HttpRestEventSourceAdapter<EventEnvelope>({
      endpoint: "https://example.com/events",
      fetch: fetchImpl,
      cursorStore,
      cursorKey: "orders",
      mapper: { map: (value) => value },
    });

    adapter.start(async () => {
      throw new Error("ingestion failure");
    });

    await expect(adapter.pull()).rejects.toThrow("ingestion failure");
    await expect(cursorStore.load("orders")).resolves.toBe("cursor-41");

    adapter.stop();
  });
});
