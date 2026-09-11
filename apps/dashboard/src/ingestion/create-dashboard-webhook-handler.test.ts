import type { HttpIngestionComposition } from "@ci/runtime";
import { describe, expect, it, vi } from "vitest";

import { createDashboardWebhookHandler } from "./create-dashboard-webhook-handler.js";

function createComposition(result: {
  readonly status: number;
  readonly body: unknown;
}): HttpIngestionComposition {
  return {
    adapter: undefined as never,
    handle: vi.fn(async () => result),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

describe("createDashboardWebhookHandler", () => {
  it("delegates the request to the ingestion composition", async () => {
    const composition = createComposition({
      status: 202,
      body: { accepted: true },
    });

    const handler = createDashboardWebhookHandler(composition);
    const request = new Request("https://example.com/webhooks/commerce", {
      method: "POST",
    });

    const response = await handler(request);

    expect(composition.handle).toHaveBeenCalledWith(request);
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      accepted: true,
    });
  });

  it("sets a JSON content type and disables caching", async () => {
    const composition = createComposition({
      status: 400,
      body: { error: "invalid" },
    });

    const handler = createDashboardWebhookHandler(composition);
    const response = await handler(
      new Request("https://example.com/webhooks/commerce", {
        method: "POST",
      }),
    );

    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("allows application headers to be added", async () => {
    const composition = createComposition({
      status: 202,
      body: { accepted: true },
    });

    const handler = createDashboardWebhookHandler(composition, {
      headers: {
        "x-runtime": "commerce-intelligence",
      },
    });

    const response = await handler(
      new Request("https://example.com/webhooks/commerce", {
        method: "POST",
      }),
    );

    expect(response.headers.get("x-runtime")).toBe("commerce-intelligence");
  });
});
