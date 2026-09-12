import { describe, expect, it, vi } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import { Runtime } from "../runtime/runtime.js";
import { createHttpIngestionComposition } from "./http-ingestion-composition.js";
import { HttpWebhookAdapter } from "./http-webhook-adapter.js";

const event: EventEnvelope = {
  id: "evt-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-10T08:00:00.000Z",
  tenantId: "tenant-1",
  payload: { value: 1 },
};

function request(): Request {
  return new Request("https://example.com/webhooks/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
  });
}

describe("createHttpIngestionComposition", () => {
  it("connects the webhook adapter to Runtime ingestion", async () => {
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const adapter = new HttpWebhookAdapter({
      path: "/webhooks/events",
    });

    const accepted = vi.fn();
    const composition = createHttpIngestionComposition({
      adapter,
      runtime,
      ingestion: {
        observer: {
          onReceived: () => undefined,
          onCompleted: (receivedEvent) => accepted(receivedEvent),
          onFailed: () => undefined,
        },
      },
    });

    composition.start();

    const response = await composition.handle(request());

    expect(response.status).toBe(202);
    expect(runtime.eventCount).toBe(1);
    expect(accepted).toHaveBeenCalledWith(event);
  });

  it("does not start the adapter twice", () => {
    const adapter = new HttpWebhookAdapter();
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const startSpy = vi.spyOn(adapter, "start");
    const composition = createHttpIngestionComposition({
      adapter,
      runtime,
    });

    composition.start();
    composition.start();

    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  it("stops the adapter and allows a later restart", async () => {
    const adapter = new HttpWebhookAdapter();
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const stopSpy = vi.spyOn(adapter, "stop");
    const composition = createHttpIngestionComposition({
      adapter,
      runtime,
    });

    composition.start();
    composition.stop();

    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect((await composition.handle(request())).status).toBe(503);

    composition.start();
    expect((await composition.handle(request())).status).toBe(202);
  });

  it("forwards handler rejection to the adapter response boundary", async () => {
    const adapter = new HttpWebhookAdapter();
    const runtime = new Runtime({ tenantId: "tenant-1" });
    const onRejected = vi.fn();
    const composition = createHttpIngestionComposition({
      adapter,
      runtime,
      ingestion: {
        observer: {
          onReceived: () => undefined,
          onCompleted: () => undefined,
          onFailed: (_event, error) => onRejected(error),
        },
      },
    });

    composition.start();

    const response = await composition.handle(
      new Request("https://example.com/webhooks/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...event, tenantId: "other-tenant" }),
      }),
    );

    expect(response.status).toBe(422);
    expect(onRejected).toHaveBeenCalledTimes(1);
  });
});
