import type { EventEnvelope } from "../contracts/event";
import { DuplicateEventError, type EventStore } from "../events";
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

      if (event.tenantId !== runtime.tenantId) {
        throw new Error(`event.tenantId does not match runtime tenant "${runtime.tenantId}"`);
      }

      const stored = options.eventStore ? await options.eventStore.has(event.id) : false;

      if (stored) {
        const outcome = createIngestionOutcome("duplicate", event);
        await notify(options.observer?.onCompleted, event, outcome, {
          eventId: event.id,
          tenantId: event.tenantId,
          status: "duplicate",
          attempts,
          durationMs: Math.max(0, now() - startedAt),
        });
        return outcome;
      }

      runtime.ingest([event]);

      let attemptsUsed = 1;
      let deliveryStatus: "accepted" | "duplicate" = "accepted";

      const eventStore = options.eventStore;

      if (eventStore) {
        const result = await executeWithRetry(async () => {
          attempts += 1;

          try {
            await eventStore.append(event);
          } catch (error) {
            if (error instanceof DuplicateEventError) {
              deliveryStatus = "duplicate";
              return;
            }

            throw new IngestionProcessingError(
              "Event persistence failed after runtime ingestion",
              "transient",
              error,
            );
          }
        }, retryPolicy);

        attemptsUsed = result.attempts;
      }

      const outcome = createIngestionOutcome(deliveryStatus, event);

      await notify(options.observer?.onCompleted, event, outcome, {
        eventId: event.id,
        tenantId: event.tenantId,
        status: deliveryStatus,
        attempts: attemptsUsed,
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
