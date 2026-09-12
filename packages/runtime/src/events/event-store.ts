import type { EventEnvelope } from "../contracts/event";

export interface EventStore {
  has(eventId: string): Promise<boolean>;
  append(event: EventEnvelope): Promise<void>;
  readAll(tenantId?: string): Promise<readonly EventEnvelope[]>;
}

export class DuplicateEventError extends Error {
  public constructor(eventId: string) {
    super(`Event already exists: ${eventId}`);
    this.name = "DuplicateEventError";
  }
}

export class InMemoryEventStore implements EventStore {
  private readonly events = new Map<string, EventEnvelope>();

  public async has(eventId: string): Promise<boolean> {
    return this.events.has(eventId);
  }

  public async append(event: EventEnvelope): Promise<void> {
    if (this.events.has(event.id)) {
      throw new DuplicateEventError(event.id);
    }

    this.events.set(event.id, event);
  }

  public async readAll(tenantId?: string): Promise<readonly EventEnvelope[]> {
    const events = [...this.events.values()];

    if (!tenantId) {
      return events;
    }

    return events.filter((event) => event.tenantId === tenantId);
  }
}
