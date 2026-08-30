import { describe, expect, it } from "vitest";
import type { EventEnvelope } from "../contracts/event.js";
import type { Projection } from "../contracts/projection.js";
import type { Query } from "../contracts/query.js";
import { DuplicateRegistrationError } from "../errors/duplicate-registration-error.js";
import { Runtime } from "./runtime.js";

interface TestState {
  count: number;
  lastEventType: string | null;
}

const testProjection: Projection<TestState> = {
  name: "test",

  createInitialState: () => ({
    count: 0,
    lastEventType: null,
  }),

  apply: (state, event) => ({
    count: state.count + 1,
    lastEventType: event.type,
  }),

  serialize: (state) => state,

  deserialize: (snapshot) =>
    snapshot as TestState,
};

const createEvent = (
  id: string,
  type = "TestEvent",
): EventEnvelope => ({
  id,
  type,
  version: 1,
  occurredAt: "2026-08-30T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: {},
});

describe("Runtime", () => {
  it("registers a projection", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    expect(runtime.projectionNames).toEqual([
      "test",
    ]);
  });

  it("rejects duplicate projection registration", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    expect(() =>
      runtime.registerProjection(testProjection),
    ).toThrow(DuplicateRegistrationError);
  });

  it("ingests events incrementally", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    runtime.ingest([
      createEvent("event-1"),
      createEvent("event-2", "AnotherEvent"),
    ]);

    const state =
      runtime.getProjectionState<TestState>(
        "test",
      );

    expect(state).toEqual({
      count: 2,
      lastEventType: "AnotherEvent",
    });

    expect(runtime.eventCount).toBe(2);
    expect(runtime.sequence).toBe(2);
  });

  it("ignores duplicate event ids", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    const event = createEvent("event-1");

    runtime.ingest([event]);
    runtime.ingest([event]);

    const state =
      runtime.getProjectionState<TestState>(
        "test",
      );

    expect(state.count).toBe(1);
    expect(runtime.eventCount).toBe(1);
  });

  it("ignores events belonging to another tenant", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    runtime.ingest([
      createEvent("event-1"),
      {
        ...createEvent("event-2"),
        tenantId: "tenant-2",
      },
    ]);

    const state =
      runtime.getProjectionState<TestState>(
        "test",
      );

    expect(state.count).toBe(1);
    expect(runtime.eventCount).toBe(1);
  });

  it("executes registered queries", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    runtime.ingest([
      createEvent("event-1"),
      createEvent("event-2"),
    ]);

    const query: Query<
      undefined,
      number
    > = {
      name: "event-count",

      execute: (snapshot) =>
        snapshot.eventCount,
    };

    runtime.registerQuery(query);

    expect(
      runtime.query("event-count", undefined),
    ).toBe(2);
  });

  it("creates and restores snapshots", () => {
    const firstRuntime = new Runtime({
      tenantId: "tenant-1",
    });

    firstRuntime.registerProjection(
      testProjection,
    );

    firstRuntime.ingest([
      createEvent("event-1"),
      createEvent("event-2"),
    ]);

    const snapshot =
      firstRuntime.snapshot();

    const secondRuntime = new Runtime({
      tenantId: "tenant-1",
    });

    secondRuntime.registerProjection(
      testProjection,
    );

    secondRuntime.restore(snapshot);

    expect(secondRuntime.eventCount).toBe(2);
    expect(secondRuntime.sequence).toBe(2);

    expect(
      secondRuntime.getProjectionState<TestState>(
        "test",
      ),
    ).toEqual({
      count: 2,
      lastEventType: "TestEvent",
    });
  });

  it("resets runtime state", () => {
    const runtime = new Runtime({
      tenantId: "tenant-1",
    });

    runtime.registerProjection(testProjection);

    runtime.ingest([
      createEvent("event-1"),
    ]);

    runtime.reset();

    expect(runtime.eventCount).toBe(0);
    expect(runtime.sequence).toBe(0);

    expect(
      runtime.getProjectionState<TestState>(
        "test",
      ),
    ).toEqual({
      count: 0,
      lastEventType: null,
    });
  });
});
