import type { EventEnvelope } from "../contracts/event";
import type { Runtime } from "../runtime/runtime.js";
import { assertValidEventEnvelope } from "./event-envelope-validation.js";

export type EventIngestionHandler = (event: EventEnvelope) => void;

export interface RuntimeIngestionHandlerOptions {
  readonly onAccepted?: (event: EventEnvelope) => void;
  readonly onRejected?: (event: EventEnvelope, error: unknown) => void;
}

export function createRuntimeIngestionHandler(
  runtime: Runtime,
  options: RuntimeIngestionHandlerOptions = {},
): EventIngestionHandler {
  return (event) => {
    try {
      assertValidEventEnvelope(event);

      if (event.tenantId !== runtime.tenantId) {
        throw new Error(`event.tenantId does not match runtime tenant "${runtime.tenantId}"`);
      }

      runtime.ingest([event]);

      options.onAccepted?.(event);
    } catch (error) {
      options.onRejected?.(event, error);
      throw error;
    }
  };
}
