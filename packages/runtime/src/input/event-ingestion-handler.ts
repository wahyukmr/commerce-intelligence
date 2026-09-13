import type { EventEnvelope } from "../contracts/event";
import type { EventStore } from "../events";
import type { RuntimeReadiness } from "../lifecycle";
import type { Runtime } from "../runtime/runtime";
import { assertValidEventEnvelope } from "./event-envelope-validation";
import {
  defaultIngestionRetryPolicy,
  executeWithRetry,
  IngestionProcessingError,
  type IngestionRetryPolicy,
} from "./ingestion-failure";
import type { IngestionObserver } from "./ingestion-observer";
import { createIngestionOutcome, type IngestionOutcome } from "./ingestion-outcome";

export type EventIngestionHandler = (
  event: EventEnvelope,
) => IngestionOutcome | Promise<IngestionOutcome>;

export interface RuntimeIngestionHandlerOptions {
  readonly eventStore?: EventStore;
  readonly retryPolicy?: IngestionRetryPolicy;
  readonly observer?: IngestionObserver;
  readonly readiness?: RuntimeReadiness;
  readonly now?: () => number;
}

export function createRuntimeIngestionHandler(
  runtime: Runtime,
  options: RuntimeIngestionHandlerOptions = {},
): EventIngestionHandler {
  const retryPolicy = options.retryPolicy ?? defaultIngestionRetryPolicy;
  const now = options.now ?? Date.now;

  return async (event) => {
    const startedAt = now();
    await notify(options.observer?.onReceived, event);

    let attempts = 0;

    try {
      assertValidEventEnvelope(event);
      options.readiness?.assertReady();

      if (event.tenantId !== runtime.tenantId) {
        throw new Error(`event.tenantId does not match runtime tenant "${runtime.tenantId}"`);
      }

      const result = await executeWithRetry(async () => {
        attempts += 1;

        let appendResult: Awaited<ReturnType<EventStore["append"]>> = {
          status: "inserted",
        };

        if (options.eventStore) {
          try {
            appendResult = await options.eventStore.append(event);
          } catch (error) {
            throw new IngestionProcessingError(
              "Event persistence failed before runtime ingestion",
              "transient",
              error,
            );
          }
        }

        // Runtime owns idempotent projection application. This call is safe
        // for both newly inserted and already persisted events.
        runtime.ingest([event]);

        return appendResult;
      }, retryPolicy);

      const outcome = createIngestionOutcome(
        result.value.status === "duplicate" ? "duplicate" : "accepted",
        event,
      );

      await notify(options.observer?.onCompleted, event, outcome, {
        eventId: event.id,
        tenantId: event.tenantId,
        status: outcome.status,
        attempts: result.attempts,
        durationMs: Math.max(0, now() - startedAt),
      });

      return outcome;
    } catch (error) {
      const decision = retryPolicy.classify(error);
      const observation = {
        eventId: event.id,
        tenantId: event.tenantId,
        status: "failed" as const,
        failureKind: decision.kind,
        attempts,
        durationMs: Math.max(0, now() - startedAt),
      };

      await notify(options.observer?.onFailed, event, error, observation);

      throw error;
    }
  };
}

async function notify<T extends readonly unknown[]>(
  callback: ((...args: T) => void | Promise<void>) | undefined,
  ...args: T
): Promise<void> {
  if (!callback) return;

  try {
    await callback(...args);
  } catch {
    // Observability must never break event ingestion.
  }
}
