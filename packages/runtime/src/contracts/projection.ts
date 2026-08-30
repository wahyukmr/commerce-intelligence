import type { EventEnvelope } from "./event";

export interface ProjectionContext {
  readonly tenantId: string;
  readonly sequence: number;
}

export interface Projection<TState, TEvent extends EventEnvelope = EventEnvelope> {
  readonly name: string;

  createInitialState(context: ProjectionContext): TState;

  apply(state: TState, event: TEvent, context: ProjectionContext): TState;

  serialize(state: TState): unknown;

  deserialize(snapshot: unknown): TState;
}
