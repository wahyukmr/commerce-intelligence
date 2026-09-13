import type { EventEnvelope } from "../contracts/event";

export type EventAppendResult =
  | {
      readonly status: "inserted";
    }
  | {
      readonly status: "duplicate";
    };

export interface EventPage {
  readonly events: readonly EventEnvelope[];
  readonly nextSequence: number | null;
}

export interface EventPageOptions {
  readonly tenantId?: string;
  readonly afterSequence?: number;
  readonly limit: number;
}

export interface EventStore {
  has(eventId: string): Promise<boolean>;

  append(event: EventEnvelope): Promise<EventAppendResult>;

  readPage(options: EventPageOptions): Promise<EventPage>;

  readAll(tenantId?: string): Promise<readonly EventEnvelope[]>;
}

export class DuplicateEventError extends Error {
  public constructor(eventId: string) {
    super(`Event already exists: ${eventId}`);
    this.name = "DuplicateEventError";
  }
}

interface StoredEvent {
  readonly sequence: number;
  readonly event: EventEnvelope;
}

export class InMemoryEventStore implements EventStore {
  private readonly events = new Map<string, StoredEvent>();
  private nextSequence = 1;

  public async has(eventId: string): Promise<boolean> {
    return this.events.has(eventId);
  }

  public async append(event: EventEnvelope): Promise<EventAppendResult> {
    if (this.events.has(event.id)) {
      return { status: "duplicate" };
    }

    this.events.set(event.id, {
      sequence: this.nextSequence,
      event,
    });

    this.nextSequence += 1;

    return { status: "inserted" };
  }

  public async readPage({
    tenantId,
    afterSequence = 0,
    limit,
  }: EventPageOptions): Promise<EventPage> {
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error("Event page limit must be a positive integer");
    }

    const storedEvents = [...this.events.values()]
      .sort((left, right) => left.sequence - right.sequence)
      .filter((stored) => {
        if (stored.sequence <= afterSequence) {
          return false;
        }

        return tenantId === undefined || stored.event.tenantId === tenantId;
      })
      .slice(0, limit);

    const events = storedEvents.map((stored) => stored.event);
    const last = storedEvents.at(-1);

    return {
      events,
      nextSequence: last?.sequence ?? null,
    };
  }

  public async readAll(tenantId?: string): Promise<readonly EventEnvelope[]> {
    const events: EventEnvelope[] = [];
    let afterSequence = 0;

    while (true) {
      const page = await this.readPage({
        tenantId,
        afterSequence,
        limit: 1000,
      });

      events.push(...page.events);

      if (page.nextSequence === null || page.events.length === 0) {
        return events;
      }

      afterSequence = page.nextSequence;
    }
  }
}
