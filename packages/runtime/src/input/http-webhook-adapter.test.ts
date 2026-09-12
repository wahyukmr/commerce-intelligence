import { describe, expect, it } from "vitest";

import type { EventEnvelope } from "../contracts/event.js";
import { HttpWebhookAdapter } from "./http-webhook-adapter.js";
import type { IngestionOutcome } from "./ingestion-outcome.js";

const event: EventEnvelope = {
  id: "evt-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-10T08:00:00.000Z",
  tenantId: "tenant-1",
  payload: {
    value: 1,
  },
};

const accepted: IngestionOutcome = {
  status: "accepted",
  eventId: event.id,
  tenantId: event.tenantId,
  receivedAt: "2026-09-11T08:00:00.000Z",
};

function createRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("https://example.com/webhooks/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body,
  });
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

describe("HttpWebhookAdapter replay protection", () => {
  it("accepts legacy body-only signatures when timestamp protection is disabled", async () => {
    const body = JSON.stringify(event);
    const secret = "secret";
    const signature = await hmacHex(body, secret);

    const receivedEvents: EventEnvelope[] = [];

    const adapter = new HttpWebhookAdapter({
      signature: {
        secret,
      },
    });

    adapter.start((receivedEvent) => {
      receivedEvents.push(receivedEvent);
      return accepted;
    });

    const response = await adapter.handle(
      createRequest(body, {
        "x-commerce-signature": `sha256=${signature}`,
      }),
    );

    expect(response.status).toBe(202);
    expect(receivedEvents).toHaveLength(1);
  });

  it("accepts a timestamped signature inside the freshness window", async () => {
    const body = JSON.stringify(event);
    const secret = "secret";

    const timestamp = String(Math.floor(Date.now() / 1000));

    const signature = await hmacHex(`${timestamp}.${body}`, secret);

    const receivedEvents: EventEnvelope[] = [];

    const adapter = new HttpWebhookAdapter({
      signature: {
        secret,
        timestampHeaderName: "x-commerce-timestamp",
        maxAgeSeconds: 300,
      },
    });

    adapter.start((receivedEvent) => {
      receivedEvents.push(receivedEvent);
      return accepted;
    });

    const response = await adapter.handle(
      createRequest(body, {
        "x-commerce-signature": `sha256=${signature}`,
        "x-commerce-timestamp": timestamp,
      }),
    );

    expect(response.status).toBe(202);
    expect(receivedEvents).toHaveLength(1);
  });

  it("rejects a missing timestamp when timestamp verification is configured", async () => {
    const body = JSON.stringify(event);
    const secret = "secret";

    const signature = await hmacHex(body, secret);

    const adapter = new HttpWebhookAdapter({
      signature: {
        secret,
        timestampHeaderName: "x-commerce-timestamp",
        maxAgeSeconds: 300,
      },
    });

    adapter.start(() => accepted);

    const response = await adapter.handle(
      createRequest(body, {
        "x-commerce-signature": `sha256=${signature}`,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects a stale timestamp before event delivery", async () => {
    const body = JSON.stringify(event);
    const secret = "secret";

    const timestamp = String(Math.floor(Date.now() / 1000) - 3600);

    const signature = await hmacHex(`${timestamp}.${body}`, secret);

    const delivered: EventEnvelope[] = [];

    const adapter = new HttpWebhookAdapter({
      signature: {
        secret,
        timestampHeaderName: "x-commerce-timestamp",
        maxAgeSeconds: 300,
      },
    });

    adapter.start((receivedEvent) => {
      delivered.push(receivedEvent);
      return accepted;
    });

    const response = await adapter.handle(
      createRequest(body, {
        "x-commerce-signature": `sha256=${signature}`,
        "x-commerce-timestamp": timestamp,
      }),
    );

    expect(response.status).toBe(408);
    expect(delivered).toHaveLength(0);
  });

  it("rejects a timestamp signature when the signed payload is incorrect", async () => {
    const body = JSON.stringify(event);
    const secret = "secret";

    const timestamp = String(Math.floor(Date.now() / 1000));

    const signature = await hmacHex(body, secret);

    const adapter = new HttpWebhookAdapter({
      signature: {
        secret,
        timestampHeaderName: "x-commerce-timestamp",
        maxAgeSeconds: 300,
      },
    });

    adapter.start(() => accepted);

    const response = await adapter.handle(
      createRequest(body, {
        "x-commerce-signature": `sha256=${signature}`,
        "x-commerce-timestamp": timestamp,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects invalid replay protection configuration", () => {
    expect(
      () =>
        new HttpWebhookAdapter({
          signature: {
            secret: "secret",
            maxAgeSeconds: 300,
          },
        }),
    ).toThrow("timestampHeaderName is required");
  });

  it("rejects content types that only contain application/json as a substring", async () => {
    const adapter = new HttpWebhookAdapter();
    adapter.start(() => accepted);

    const response = await adapter.handle(
      new Request("https://example.com/webhooks/events", {
        method: "POST",
        headers: { "content-type": "text/application/json" },
        body: JSON.stringify(event),
      }),
    );

    expect(response.status).toBe(415);
  });
});

describe("HttpWebhookAdapter security hardening", () => {
  it("rejects oversized request bodies", async () => {
    const adapter = new HttpWebhookAdapter({
      security: { maxBodyBytes: 10 },
    });

    adapter.start(async () => accepted);

    const response = await adapter.handle(createRequest(JSON.stringify(event)));

    expect(response.status).toBe(413);
  });

  it("requires configured security headers", async () => {
    const adapter = new HttpWebhookAdapter({
      security: {
        requiredHeaders: ["x-source-token"],
      },
    });

    adapter.start(async () => accepted);

    const response = await adapter.handle(createRequest(JSON.stringify(event)));

    expect(response.status).toBe(403);
  });

  it("returns accepted and duplicate semantics from the ingestion handler", async () => {
    const adapter = new HttpWebhookAdapter();
    adapter.start(async () => ({
      ...accepted,
      status: "duplicate",
    }));

    const response = await adapter.handle(createRequest(JSON.stringify(event)));

    expect(response).toEqual({
      status: 202,
      body: {
        accepted: false,
        duplicate: true,
        eventId: "evt-1",
        outcome: "duplicate",
      },
    });
  });
});
