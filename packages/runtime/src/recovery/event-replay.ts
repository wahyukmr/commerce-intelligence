import type { EventEnvelope } from "../contracts/event";
import type { EventStore } from "../events/event-store";
import type { Runtime } from "../runtime/runtime";

export interface EventReplayResult {
  readonly tenantId: string;
  readonly eventsRead: number;
  readonly eventsApplied: number;
}

export interface EventReplayOptions {
  readonly tenantId?: string;
  readonly onEvent?: (event: EventEnvelope, index: number) => void | Promise<void>;
}

export async function replayEventStore(
  store: EventStore,
  runtime: Runtime,
  options: EventReplayOptions = {},
): Promise<EventReplayResult> {
  if (options.tenantId && options.tenantId !== runtime.tenantId) {
    throw new Error(
      `Replay tenant "${options.tenantId}" does not match runtime tenant "${runtime.tenantId}"`,
    );
  }

  const events = await store.readAll(options.tenantId);

  let eventsApplied = 0;

  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];

    if (!event) {
      continue;
    }

    await options.onEvent?.(event, index);
    const eventCountBefore = runtime.eventCount;
    runtime.ingest([event]);
    if (runtime.eventCount > eventCountBefore) {
      eventsApplied += 1;
    }
  }

  return {
    tenantId: options.tenantId ?? runtime.tenantId,
    eventsRead: events.length,
    eventsApplied,
  };
}
