import type { RecoveryState, RecoveryStateStore } from "@ci/runtime";

export interface PostgresQueryResultRow {
  readonly tenant_id: string;
  readonly sequence: string | number;
  readonly snapshot: unknown;
  readonly updated_at: string | Date;
}

export interface PostgresRecoveryStateStoreClient {
  query<TResult = PostgresQueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: readonly TResult[] }>;
}

export interface PostgresRecoveryStateStoreOptions {
  readonly client: PostgresRecoveryStateStoreClient;
  readonly tableName?: string;
}

export class PostgresRecoveryStateStore implements RecoveryStateStore {
  private readonly client: PostgresRecoveryStateStoreClient;
  private readonly tableName: string;

  constructor({ client, tableName = "runtime_recovery_state" }: PostgresRecoveryStateStoreOptions) {
    this.client = client;
    this.tableName = assertSafeIdentifier(tableName);
  }

  public async load(tenantId: string): Promise<RecoveryState | null> {
    const result = await this.client.query<PostgresQueryResultRow>(
      `
        SELECT tenant_id, sequence, snapshot, updated_at
        FROM ${this.tableName}
        WHERE tenant_id = $1
        LIMIT 1
      `,
      [tenantId],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      tenantId: row.tenant_id,
      sequence: toSequence(row.sequence),
      snapshot: parseSnapshot(row.snapshot),
      updatedAt: toTimestamp(row.updated_at),
    };
  }

  public async save(state: RecoveryState): Promise<void> {
    validateState(state);

    await this.client.query(
      `
        INSERT INTO ${this.tableName} (
          tenant_id,
          sequence,
          snapshot,
          updated_at
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (tenant_id)
        DO UPDATE SET
          sequence = EXCLUDED.sequence,
          snapshot = EXCLUDED.snapshot,
          updated_at = EXCLUDED.updated_at
      `,
      [state.tenantId, state.sequence, JSON.stringify(state.snapshot), state.updatedAt],
    );
  }

  public async clear(tenantId: string): Promise<void> {
    await this.client.query(
      `
        DELETE FROM ${this.tableName}
        WHERE tenant_id = $1
      `,
      [tenantId],
    );
  }
}

function validateState(state: RecoveryState): void {
  if (state.tenantId.trim().length === 0) {
    throw new Error("Recovery state tenantId must be non-empty");
  }

  if (!Number.isSafeInteger(state.sequence) || state.sequence < 0) {
    throw new Error("Recovery state sequence must be a non-negative safe integer");
  }

  if (Number.isNaN(Date.parse(state.updatedAt))) {
    throw new Error("Recovery state updatedAt must be a valid timestamp");
  }
}

function parseSnapshot(value: unknown) {
  if (typeof value === "string") {
    return JSON.parse(value);
  }

  return value;
}

function toSequence(value: string | number): number {
  const sequence = Number(value);

  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new Error(`Invalid recovery sequence: ${value}`);
  }

  return sequence;
}

function toTimestamp(value: string | Date): string {
  const timestamp = value instanceof Date ? value.toISOString() : new Date(value).toISOString();

  if (Number.isNaN(Date.parse(timestamp))) {
    throw new Error("Invalid recovery state timestamp");
  }

  return timestamp;
}

function assertSafeIdentifier(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error(`Unsafe PostgreSQL identifier: ${value}`);
  }

  return value;
}
