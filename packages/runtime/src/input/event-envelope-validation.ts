import type { EventEnvelope } from "../contracts/event";

export class EventEnvelopeValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EventEnvelopeValidationError";
  }
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new EventEnvelopeValidationError(`${field} must be a non-empty string`);
  }
}

function assertValidTimestamp(value: unknown, field: string): asserts value is string {
  assertNonEmptyString(value, field);

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new EventEnvelopeValidationError(`${field} must be a valid timestamp`);
  }
}

export function assertValidEventEnvelope(event: EventEnvelope): asserts event is EventEnvelope {
  if (!event || typeof event !== "object") {
    throw new EventEnvelopeValidationError("event must be an object");
  }

  assertNonEmptyString(event.id, "event.id");
  assertNonEmptyString(event.type, "event.type");
  assertNonEmptyString(event.version, "event.version");
  assertValidTimestamp(event.occurredAt, "event.occurredAt");
  assertNonEmptyString(event.tenantId, "event.tenantId");

  if (!Object.hasOwn(event, "payload")) {
    throw new EventEnvelopeValidationError("event.payload must be present");
  }

  if (
    event.metadata !== undefined &&
    (typeof event.metadata !== "object" || event.metadata === null)
  ) {
    throw new EventEnvelopeValidationError("event.metadata must be an object when provided");
  }
}
