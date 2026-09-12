import { describe, expect, it } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import type { IngestionAdapter, IngestionEventHandler } from "./ingestion-adapter.js";
import type { IngestionOutcome } from "./ingestion-outcome.js";

const event: EventEnvelope = {
  id: "evt_1",
  type: "customer.registered",
  version: 1,
  occurredAt: "2026-01-01T00:00:00.000Z",
  tenantId: "tenant_1",
  payload: { customerId: "cus_1" },
};

const accepted: IngestionOutcome = {
  status: "accepted",
  eventId: event.id,
  tenantId: event.tenantId,
  receivedAt: "2026-09-11T08:00:00.000Z",
};

class FakeIngestionAdapter implements IngestionAdapter {
  public readonly name = "fake-ingestion";
  private handler: IngestionEventHandler | undefined;
  private started = false;

  public start(handler: IngestionEventHandler): void {
    if (this.started) {
      throw new Error("Adapter already started");
    }

    this.handler = handler;
    this.started = true;
  }

  public stop(): void {
    this.handler = undefined;
    this.started = false;
  }

  public emit(nextEvent: EventEnvelope): void {
    if (!this.handler) {
      throw new Error("Adapter is not started");
    }

    void this.handler(nextEvent);
  }
}

describe("IngestionAdapter", () => {
  it("delivers canonical events through the injected handler", async () => {
    const adapter = new FakeIngestionAdapter();
    const received: EventEnvelope[] = [];
    let resolve!: () => void;
    const completed = new Promise<void>((done) => {
      resolve = done;
    });

    await adapter.start(async (nextEvent) => {
      received.push(nextEvent);
      resolve();
      return accepted;
    });

    adapter.emit(event);
    await completed;

    expect(received).toEqual([event]);
  });

  it("requires an active lifecycle before emitting", () => {
    const adapter = new FakeIngestionAdapter();

    expect(() => adapter.emit(event)).toThrow("Adapter is not started");
  });

  it("stops delivery after stop", () => {
    const adapter = new FakeIngestionAdapter();
    const received: EventEnvelope[] = [];

    adapter.start((nextEvent) => {
      received.push(nextEvent);
      return accepted;
    });
    adapter.stop();

    expect(() => adapter.emit(event)).toThrow("Adapter is not started");
    expect(received).toEqual([]);
  });
});
