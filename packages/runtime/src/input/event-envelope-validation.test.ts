import { describe, expect, it } from "vitest";

import type { EventEnvelope } from "../contracts/event.js";
import {
  assertValidEventEnvelope,
  EventEnvelopeValidationError,
} from "./event-envelope-validation.js";

const validEvent: EventEnvelope = {
  id: "evt-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-13T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: { value: 1 },
};

describe("assertValidEventEnvelope", () => {
  it("accepts a structurally valid event envelope", () => {
    expect(() => assertValidEventEnvelope(validEvent)).not.toThrow();
  });

  it.each([
    ["id", { id: "" }],
    ["type", { type: "" }],
    ["occurredAt", { occurredAt: "not-a-timestamp" }],
    ["tenantId", { tenantId: "" }],
  ])("rejects an invalid %s", (field, override) => {
    expect(() => assertValidEventEnvelope({ ...validEvent, ...override })).toThrow(
      EventEnvelopeValidationError,
    );

    expect(() => assertValidEventEnvelope({ ...validEvent, ...override })).toThrow(field);
  });

  it("rejects invalid versions and missing payload", () => {
    expect(() => assertValidEventEnvelope({ ...validEvent, version: 0 })).toThrow(
      "event.version must be a positive integer",
    );

    const withoutPayload = { ...validEvent } as Record<string, unknown>;
    delete withoutPayload.payload;

    expect(() => assertValidEventEnvelope(withoutPayload as unknown as EventEnvelope)).toThrow(
      "event.payload must be present",
    );
  });

  it("rejects non-object metadata", () => {
    expect(() =>
      assertValidEventEnvelope({
        ...validEvent,
        metadata: "invalid" as unknown as Record<string, unknown>,
      }),
    ).toThrow("event.metadata must be an object when provided");
  });
});
