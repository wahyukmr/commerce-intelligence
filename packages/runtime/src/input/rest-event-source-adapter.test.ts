import { describe, expect, it, vi } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import type { IngestionOutcome } from "./ingestion-outcome.js";
import { HttpRestEventSourceAdapter } from "./rest-event-source-adapter.js";

interface SourceEvent {
  readonly id: string;
}

const event = (id: string): EventEnvelope => ({
  id,
  type: "source.event",
  version: 1,
  occurredAt: "2026-09-12T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: { id },
});

const accepted: IngestionOutcome = {
  status: "accepted",
  eventId: "event",
  tenantId: "tenant-1",
  receivedAt: "2026-09-12T00:00:00.000Z",
};

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("HttpRestEventSourceAdapter", () => {
  it("pulls events, delivers them, and advances the cursor", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        response({
          events: [{ id: "a" }, { id: "b" }],
          cursor: "next",
        }),
      )
      .mockResolvedValueOnce(response({ events: [], cursor: "next-2" }));

    const received: EventEnvelope[] = [];

    const adapter = new HttpRestEventSourceAdapter<SourceEvent>({
      endpoint: "https://example.com/events",
      fetch: fetchImpl,
      mapper: {
        map: (value) => event(value.id),
      },
    });

    adapter.start(async (incoming) => {
      received.push(incoming);
      return { ...accepted, eventId: incoming.id };
    });

    const first = await adapter.pull();

    expect(first).toEqual({
      eventsRead: 2,
      eventsDelivered: 2,
      cursor: "next",
    });

    expect(received.map((item) => item.id)).toEqual(["a", "b"]);
    await adapter.pull();

    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const secondRequest = fetchImpl.mock.calls[1]?.[0];
    expect(String(secondRequest)).toContain("cursor=next");

    adapter.stop();
  });

  it("does not allow overlapping polls", async () => {
    let resolveResponse!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });

    const fetchImpl = vi.fn<typeof fetch>().mockReturnValue(pending);

    const adapter = new HttpRestEventSourceAdapter<SourceEvent>({
      endpoint: "https://example.com/events",
      fetch: fetchImpl,
      mapper: {
        map: (value) => event(value.id),
      },
    });

    adapter.start(async () => accepted);

    const first = adapter.pull();
    const second = await adapter.pull();

    expect(second).toEqual({
      eventsRead: 0,
      eventsDelivered: 0,
      cursor: undefined,
    });

    resolveResponse(response({ events: [] }));
    await first;

    adapter.stop();
  });

  it("fails a pull when the source returns a non-success status", async () => {
    const adapter = new HttpRestEventSourceAdapter<SourceEvent>({
      endpoint: "https://example.com/events",
      fetch: vi.fn<typeof fetch>().mockResolvedValue(response({}, 503)),
      mapper: {
        map: (value) => event(value.id),
      },
    });

    adapter.start(async () => accepted);

    await expect(adapter.pull()).rejects.toThrow("status 503");

    adapter.stop();
  });

  it("fails a pull when the response shape is invalid", async () => {
    const adapter = new HttpRestEventSourceAdapter<SourceEvent>({
      endpoint: "https://example.com/events",
      fetch: vi.fn<typeof fetch>().mockResolvedValue(response({ events: {} })),
      mapper: {
        map: (value) => event(value.id),
      },
    });

    adapter.start(async () => accepted);

    await expect(adapter.pull()).rejects.toThrow("response.events must be an array");

    adapter.stop();
  });

  it("reports interval polling errors without stopping the adapter", async () => {
    vi.useFakeTimers();

    try {
      const pollError = vi.fn();
      const adapter = new HttpRestEventSourceAdapter<SourceEvent>({
        endpoint: "https://example.com/events",
        fetch: vi.fn<typeof fetch>().mockRejectedValue(new Error("source unavailable")),
        mapper: {
          map: (value) => event(value.id),
        },
        pollIntervalMs: 1000,
        onPollError: pollError,
      });

      adapter.start(async () => accepted);
      await vi.advanceTimersByTimeAsync(1000);

      expect(pollError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "source unavailable",
        }),
      );
      expect(adapter.running).toBe(true);

      adapter.stop();
    } finally {
      vi.useRealTimers();
    }
  });
});
