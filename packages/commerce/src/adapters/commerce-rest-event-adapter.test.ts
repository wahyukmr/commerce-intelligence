import type { IngestionOutcome } from "@ci/runtime";
import { describe, expect, it, vi } from "vitest";
import { createCommerceRestEventAdapter } from "./commerce-rest-event-adapter.js";

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("createCommerceRestEventAdapter", () => {
  it("maps source records to canonical EventEnvelope values", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        events: [
          {
            id: "evt-1",
            type: "order.paid",
            occurredAt: "2026-09-12T00:00:00.000Z",
            tenantId: "tenant-1",
            payload: {
              orderId: "order-1",
            },
          },
        ],
      }),
    );

    const received: unknown[] = [];

    const adapter = createCommerceRestEventAdapter({
      endpoint: "https://example.com/events",
      fetch: fetchImpl,
    });

    adapter.start(async (event): Promise<IngestionOutcome> => {
      received.push(event);
      return {
        status: "accepted",
        eventId: event.id,
        tenantId: event.tenantId,
        receivedAt: "2026-09-13T00:00:00.000Z",
      };
    });

    const result = await adapter.pull();

    expect(result.eventsDelivered).toBe(1);
    expect(received).toEqual([
      {
        id: "evt-1",
        type: "order.paid",
        version: 1,
        occurredAt: "2026-09-12T00:00:00.000Z",
        tenantId: "tenant-1",
        payload: {
          orderId: "order-1",
        },
        metadata: undefined,
      },
    ]);

    adapter.stop();
  });
});
