import type { EventEnvelope } from "../contracts/event";
import type { IngestionOutcome } from "./ingestion-outcome";

export type IngestionEventHandler = (
  event: EventEnvelope,
) => IngestionOutcome | Promise<IngestionOutcome>;

export interface IngestionAdapter {
  readonly name: string;
  start(handler: IngestionEventHandler): void | Promise<void>;
  stop(): void | Promise<void>;
}
