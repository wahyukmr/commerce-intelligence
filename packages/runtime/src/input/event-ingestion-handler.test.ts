import { describe, expect, it, vi } from "vitest";

import type { EventEnvelope } from "../contracts/event";
import { Runtime } from "../runtime/runtime.js";
import { EventEnvelopeValidationError } from "./event-envelope-validation.js";
import { createRuntimeIngestionHandler } from "./event-ingestion-handler.js";

function createEvent(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return {
    id: "evt-1",
    type: "test.event",
    version: 1,
    occurredAt: "2026-09-10T08:00:00.000Z",
    tenantId: "tenant-1",
    payload: {
      value: 1,
    },
    ...overrides,
  };
}

describe("createRuntimeIngestionHandler", () => {
  it("validates and ingests a valid event", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    const onAccepted = vi.fn();

    const handler = createRuntimeIngestionHandler(runtime, {
      onAccepted,
    });

    const event = createEvent();

    handler(event);

    expect(runtime.eventCount).toBe(1);
    expect(onAccepted).toHaveBeenCalledWith(event);
  });

  it("rejects invalid events before runtime ingestion", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    const onRejected = vi.fn();

    const handler = createRuntimeIngestionHandler(runtime, {
      onRejected,
    });

    const event = createEvent({
      id: "",
    });

    expect(() => handler(event)).toThrow(EventEnvelopeValidationError);

    expect(runtime.eventCount).toBe(0);
    expect(onRejected).toHaveBeenCalledTimes(1);
    expect(onRejected.mock.calls[0]?.[0]).toBe(event);
  });

  it("does not invoke accepted callback after runtime rejects the event", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    const onAccepted = vi.fn();
    const onRejected = vi.fn();

    const handler = createRuntimeIngestionHandler(runtime, {
      onAccepted,
      onRejected,
    });

    const event = createEvent({
      tenantId: "other-tenant",
    });

    expect(() => handler(event)).toThrow();

    expect(onAccepted).not.toHaveBeenCalled();
    expect(onRejected).toHaveBeenCalledTimes(1);
  });
});
