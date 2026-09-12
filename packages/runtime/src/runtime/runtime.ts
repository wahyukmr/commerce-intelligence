import type { EventEnvelope } from "../contracts/event";
import type { Projection } from "../contracts/projection";
import type { Query } from "../contracts/query";
import type { RuntimeSnapshot } from "../contracts/snapshot";
import { ProjectionRegistry } from "../registry/projection-registry";
import { QueryRegistry } from "../registry/query-registry";
import { RuntimeState } from "./runtime-state";

export interface RuntimeOptions {
  readonly tenantId: string;
}

export class Runtime {
  private readonly _tenantId: string;

  private readonly projections = new ProjectionRegistry();

  private readonly queries = new QueryRegistry();

  private readonly state: RuntimeState;

  constructor(options: RuntimeOptions) {
    this._tenantId = options.tenantId;

    this.state = new RuntimeState(options.tenantId);
  }

  registerProjection(projection: Projection<unknown>): void {
    this.projections.register(projection);

    this.state.ensureProjection(projection);
  }

  registerQuery(query: Query<unknown, unknown>): void {
    this.queries.register(query);
  }

  ingest(events: readonly EventEnvelope[]): void {
    for (const event of events) {
      if (event.tenantId !== this._tenantId) {
        continue;
      }

      this.state.apply(event);
    }
  }

  query<TInput, TResult>(name: string, input: TInput): TResult {
    const query = this.queries.get(name) as Query<TInput, TResult>;

    return query.execute(this.snapshot(), input, {
      tenantId: this._tenantId,
    });
  }

  snapshot(): RuntimeSnapshot {
    return this.state.snapshot();
  }

  restore(snapshot: RuntimeSnapshot): void {
    if (!snapshot.tenantIds.includes(this._tenantId)) {
      throw new Error(`Snapshot does not belong to tenant "${this._tenantId}".`);
    }

    this.state.restore(snapshot);
  }

  reset(): void {
    this.state.reset();
  }

  getProjectionState<TState>(name: string): TState {
    return this.state.getProjectionState(name) as TState;
  }

  get projectionNames(): readonly string[] {
    return this.projections.list();
  }

  get queryNames(): readonly string[] {
    return this.queries.list();
  }

  get sequence(): number {
    return this.state.currentSequence;
  }

  get eventCount(): number {
    return this.state.currentEventCount;
  }

  get tenantId(): string {
    return this._tenantId;
  }
}
