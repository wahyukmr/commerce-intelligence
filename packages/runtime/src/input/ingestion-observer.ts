import type { EventEnvelope } from "../contracts/event";
import type { IngestionFailureKind } from "./ingestion-failure";
import type { IngestionOutcome } from "./ingestion-outcome";

export interface IngestionObservation {
  readonly eventId: string;
  readonly tenantId: string;
  readonly status: "accepted" | "duplicate" | "failed";
  readonly failureKind?: IngestionFailureKind;
  readonly attempts: number;
  readonly durationMs: number;
}

export interface IngestionObserver {
  onReceived(event: EventEnvelope): void | Promise<void>;
  onCompleted(
    event: EventEnvelope,
    outcome: IngestionOutcome,
    observation: IngestionObservation,
  ): void | Promise<void>;
  onFailed(
    event: EventEnvelope,
    error: unknown,
    observation: IngestionObservation,
  ): void | Promise<void>;
}

export const noopIngestionObserver: IngestionObserver = {
  onReceived: () => undefined,
  onCompleted: () => undefined,
  onFailed: () => undefined,
};
