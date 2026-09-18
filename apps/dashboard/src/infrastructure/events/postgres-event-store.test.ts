import { describe, expect, it } from "vitest";

import { PostgresEventStore, type PostgresEventStoreClient } from "./postgres-event-store";

const event = {
  id: "evt-1",
  type: "test.event",
  version: 1,
  occurredAt: "2026-09-13T00:00:00.000Z",
  tenantId: "tenant-1",
  payload: { value: 1 },
} as const;

describe("PostgresEventStore", () => {
  it("returns inserted when PostgreSQL returns a row", async () => {
    const client = createClient(() => ({
      rows: [{ inserted: 1 }],
    }));

    const store = new PostgresEventStore({ client });

    await expect(store.append(event)).resolves.toEqual({
      status: "inserted",
    });
  });

  it("returns duplicate when ON CONFLICT produces no row", async () => {
    const client = createClient(() => ({ rows: [] }));
    const store = new PostgresEventStore({ client });

    await expect(store.append(event)).resolves.toEqual({
      status: "duplicate",
    });
  });

  it("reads ordered event pages with tenant and sequence filters", async () => {
    const queries: Array<{ text: string; values: readonly unknown[] }> = [];

    const client: PostgresEventStoreClient = {
      async query<TResult>(text: string, values: readonly unknown[] = []) {
        queries.push({ text, values });

        return {
          rows: [
            {
              id: "evt-2",
              sequence: "2",
              tenant_id: "tenant-1",
              type: "test.event",
              version: "1",
              occurred_at: "2026-09-13T00:00:00.000Z",
              payload: { value: 2 },
              metadata: null,
            },
          ] as TResult[],
        };
      },
    };

    const store = new PostgresEventStore({ client });
    const page = await store.readPage({
      tenantId: "tenant-1",
      afterSequence: 1,
      limit: 50,
    });

    expect(page.events[0]?.id).toBe("evt-2");
    expect(page.nextSequence).toBe(2);
    expect(queries[0]?.values).toEqual([1, "tenant-1", 50]);
    expect(queries[0]?.text).toContain("sequence > $1");
    expect(queries[0]?.text).toContain("tenant_id = $2");
    expect(queries[0]?.text).toContain("LIMIT $3");
  });

  it("normalizes database version and metadata into the event envelope", async () => {
    const client: PostgresEventStoreClient = {
      async query<TResult>() {
        return {
          rows: [
            {
              id: "evt-3",
              sequence: "3",
              tenant_id: "tenant-1",
              type: "test.event",
              version: "2",
              occurred_at: "2026-09-13T00:00:00.000Z",
              payload: { value: 3 },
              metadata: { source: "postgres" },
            },
          ] as TResult[],
        };
      },
    };

    const store = new PostgresEventStore({ client });
    const page = await store.readPage({ limit: 10 });

    expect(page.events[0]).toEqual({
      id: "evt-3",
      type: "test.event",
      version: 2,
      occurredAt: "2026-09-13T00:00:00.000Z",
      tenantId: "tenant-1",
      payload: { value: 3 },
      metadata: { source: "postgres" },
    });
  });
});

function createClient(handler: () => { rows: readonly unknown[] }): PostgresEventStoreClient {
  return {
    async query<TResult>() {
      return handler() as { rows: readonly TResult[] };
    },
  };
}
