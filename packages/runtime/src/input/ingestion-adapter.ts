import type { EventEnvelope } from "../contracts/event";

export type IngestionEventHandler = (event: EventEnvelope) => void | Promise<void>;

export interface IngestionAdapter {
  readonly name: string;
  start(handler: IngestionEventHandler): void | Promise<void>;
  stop(): void | Promise<void>;
}
