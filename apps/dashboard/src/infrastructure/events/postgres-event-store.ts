import type {
  EventAppendResult,
  EventEnvelope,
  EventPage,
  EventPageOptions,
  EventStore,
} from "@ci/runtime";

export interface PostgresEventQueryResultRow {
  readonly id: string;
  readonly sequence: string | number;
  readonly tenant_id: string;
  readonly type: string;
  readonly version: number | string;
  readonly occurred_at: string | Date;
  readonly payload: unknown;
  readonly metadata: unknown | null;
}

export interface PostgresEventQueryResult<TResult = unknown> {
  readonly rows: readonly TResult[];
}

export interface PostgresEventStoreClient {
  query<TResult = unknown>(
    text: string,
    values?: readonly unknown[],
  ): Promise<PostgresEventQueryResult<TResult>>;
}

export interface PostgresEventStoreOptions {
  readonly client: PostgresEventStoreClient;
  readonly tableName?: string;
}

export class PostgresEventStore implements EventStore {
  private readonly client: PostgresEventStoreClient;
  private readonly tableName: string;

  public constructor({ client, tableName = "commerce_events" }: PostgresEventStoreOptions) {
    this.client = client;
    this.tableName = assertSafeIdentifier(tableName);
  }

  public async has(eventId: string): Promise<boolean> {
    const result = await this.client.query<{ exists: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM ${this.tableName} WHERE id = $1) AS exists`,
      [eventId],
    );

    return result.rows[0]?.exists === true;
  }

  public async append(event: EventEnvelope): Promise<EventAppendResult> {
    const result = await this.client.query<{ inserted: number }>(
      `
        INSERT INTO ${this.tableName}
          (id, tenant_id, type, version, occurred_at, payload, metadata)
        VALUES
          ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
        ON CONFLICT (id) DO NOTHING
        RETURNING 1 AS inserted
      `,
      [
        event.id,
        event.tenantId,
        event.type,
        event.version,
        event.occurredAt,
        JSON.stringify(event.payload),
        event.metadata === undefined ? null : JSON.stringify(event.metadata),
      ],
    );

    return result.rows.length > 0 ? { status: "inserted" } : { status: "duplicate" };
  }

  public async readPage({
    tenantId,
    afterSequence = 0,
    limit,
  }: EventPageOptions): Promise<EventPage> {
    assertPositiveInteger(limit, "Event page limit");
    assertNonNegativeInteger(afterSequence, "Event page sequence");

    const values: unknown[] = [afterSequence];
    const tenantPredicate = tenantId ? "AND tenant_id = $2" : "";

    if (tenantId) {
      values.push(tenantId);
    }

    values.push(limit);

    const limitPlaceholder = tenantId ? "$3" : "$2";

    const result = await this.client.query<PostgresEventQueryResultRow>(
      `
        SELECT
          id,
          sequence,
          tenant_id,
          type,
          version,
          occurred_at,
          payload,
          metadata
        FROM ${this.tableName}
        WHERE sequence > $1
        ${tenantPredicate}
        ORDER BY sequence ASC
        LIMIT ${limitPlaceholder}
      `,
      values,
    );

    const events = result.rows.map(toEventEnvelope);
    const lastRow = result.rows.at(-1);

    return {
      events,
      nextSequence: lastRow === undefined ? null : toSequence(lastRow.sequence),
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

      if (page.events.length === 0 || page.nextSequence === null) {
        return events;
      }

      afterSequence = page.nextSequence;
    }
  }
}

function toEventEnvelope(row: PostgresEventQueryResultRow): EventEnvelope {
  return {
    id: row.id,
    type: row.type,
    version: toVersion(row.version),
    occurredAt:
      row.occurred_at instanceof Date
        ? row.occurred_at.toISOString()
        : new Date(row.occurred_at).toISOString(),
    tenantId: row.tenant_id,
    payload: row.payload,
    ...(row.metadata === null || row.metadata === undefined
      ? {}
      : { metadata: toMetadata(row.metadata) }),
  };
}

function toVersion(value: number | string): number {
  const version = Number(value);

  if (!Number.isSafeInteger(version) || version < 1) {
    throw new Error(`Invalid event version: ${value}`);
  }

  return version;
}

function toMetadata(value: unknown): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Event metadata must be a JSON object");
  }

  return value as Readonly<Record<string, unknown>>;
}

function toSequence(value: string | number): number {
  const sequence = Number(value);

  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new Error(`Invalid event journal sequence: ${value}`);
  }

  return sequence;
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

function assertSafeIdentifier(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
  }

  return value;
}
