import type {
  EventEnvelope,
  EventStore,
  RecoveryStateStore,
  Runtime,
  RuntimeReadiness,
} from "@ci/runtime";

export interface RuntimeRecoveryResult {
  readonly tenantId: string;
  readonly eventsRead: number;
  readonly eventsApplied: number;
  readonly pagesRead: number;
  readonly resumedFromSequence: number;
  readonly checkpointedSequence: number;
}

export interface RuntimeRecoveryOptions {
  readonly pageSize?: number;
  readonly readiness?: RuntimeReadiness;
  readonly stateStore?: RecoveryStateStore;
  readonly resetState?: boolean;
  readonly onEvent?: (event: EventEnvelope, index: number) => void | Promise<void>;
}

export async function recoverRuntime(
  runtime: Runtime,
  eventStore: EventStore,
  options: RuntimeRecoveryOptions = {},
): Promise<RuntimeRecoveryResult> {
  const pageSize = options.pageSize ?? 1000;

  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new Error("Runtime recovery pageSize must be a positive integer");
  }

  options.readiness?.beginRecovery();

  const storedState = options.resetState
    ? null
    : options.stateStore
      ? await options.stateStore.load(runtime.tenantId)
      : null;

  if (storedState) {
    if (storedState.tenantId !== runtime.tenantId) {
      throw new Error("Recovery state tenant does not match runtime tenant");
    }

    runtime.restore(storedState.snapshot);
  } else {
    runtime.reset();

    if (options.resetState && options.stateStore) {
      await options.stateStore.clear(runtime.tenantId);
    }
  }

  let afterSequence = storedState?.sequence ?? 0;
  const resumedFromSequence = afterSequence;
  let eventsRead = 0;
  let eventsApplied = 0;
  let pagesRead = 0;
  let checkpointedSequence = afterSequence;

  try {
    while (true) {
      const page = await eventStore.readPage({
        tenantId: runtime.tenantId,
        afterSequence,
        limit: pageSize,
      });

      pagesRead += 1;

      for (const event of page.events) {
        await options.onEvent?.(event, eventsRead);
        runtime.ingest([event]);
        eventsRead += 1;
        eventsApplied += 1;
      }

      if (page.events.length === 0) {
        options.readiness?.markReady();

        return {
          tenantId: runtime.tenantId,
          eventsRead,
          eventsApplied,
          pagesRead,
          resumedFromSequence,
          checkpointedSequence,
        };
      }

      if (page.nextSequence === null) {
        throw new Error("Event page returned events without nextSequence");
      }

      checkpointedSequence = page.nextSequence;
      afterSequence = page.nextSequence;

      if (options.stateStore) {
        await options.stateStore.save({
          tenantId: runtime.tenantId,
          sequence: checkpointedSequence,
          snapshot: runtime.snapshot(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    options.readiness?.beginRecovery();
    throw error;
  }
}
