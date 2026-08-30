import type { EventEnvelope } from "../contracts/event.js";
import type { Projection, ProjectionContext } from "../contracts/projection.js";
import type { ProjectionSnapshot, RuntimeSnapshot } from "../contracts/snapshot.js";

interface ProjectionState {
  readonly projection: Projection<unknown>;
  state: unknown;
}

export class RuntimeState {
  private sequence = 0;
  private eventCount = 0;

  private readonly processedEventIds = new Set<string>();

  private readonly projectionStates = new Map<string, ProjectionState>();

  ensureProjection(projection: Projection<unknown>, tenantId: string): void {
    if (this.projectionStates.has(projection.name)) {
      return;
    }

    const context: ProjectionContext = {
      tenantId,
      sequence: this.sequence,
    };

    this.projectionStates.set(projection.name, {
      projection,
      state: projection.createInitialState(context),
    });
  }

  apply(event: EventEnvelope): void {
    if (this.processedEventIds.has(event.id)) {
      return;
    }

    this.sequence += 1;

    for (const entry of this.projectionStates.values()) {
      const context: ProjectionContext = {
        tenantId: event.tenantId,
        sequence: this.sequence,
      };

      entry.state = entry.projection.apply(entry.state, event, context);
    }

    this.processedEventIds.add(event.id);
    this.eventCount += 1;
  }

  restore(snapshot: RuntimeSnapshot): void {
    this.sequence = snapshot.sequence;
    this.eventCount = snapshot.eventCount;

    this.processedEventIds.clear();

    for (const eventId of snapshot.processedEventIds) {
      this.processedEventIds.add(eventId);
    }

    for (const projectionSnapshot of snapshot.projections) {
      const entry = this.projectionStates.get(projectionSnapshot.name);

      if (!entry) {
        continue;
      }

      entry.state = entry.projection.deserialize(projectionSnapshot.state);
    }
  }

  snapshot(): RuntimeSnapshot {
    const projections: ProjectionSnapshot[] = [];

    for (const entry of this.projectionStates.values()) {
      projections.push({
        name: entry.projection.name,
        state: entry.projection.serialize(entry.state),
      });
    }

    return {
      runtimeVersion: 1,
      sequence: this.sequence,
      eventCount: this.eventCount,
      tenantIds: [],
      processedEventIds: [...this.processedEventIds],
      projections,
    };
  }

  getProjectionState(name: string): unknown {
    return this.projectionStates.get(name)?.state;
  }

  reset(): void {
    this.sequence = 0;
    this.eventCount = 0;

    this.processedEventIds.clear();

    for (const entry of this.projectionStates.values()) {
      entry.state = entry.projection.createInitialState({
        tenantId: "",
        sequence: 0,
      });
    }
  }

  get currentSequence(): number {
    return this.sequence;
  }

  get currentEventCount(): number {
    return this.eventCount;
  }
}
