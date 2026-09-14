import { describe, expect, it } from "vitest";

import {
  PostgresRecoveryStateStore,
  type PostgresRecoveryStateStoreClient,
} from "./postgres-recovery-state-store.js";

const snapshot = {
  runtimeVersion: 1,
  sequence: 2,
  eventCount: 2,
  tenantIds: ["tenant-1"],
  processedEventIds: ["evt-1", "evt-2"],
  projections: [],
} as const;

describe("PostgresRecoveryStateStore", () => {
  it("loads a recovery state", async () => {
    const client = createClient(() => ({
      rows: [
        {
          tenant_id: "tenant-1",
          sequence: "12",
          snapshot,
          updated_at: "2026-09-13T10:00:00.000Z",
        },
      ],
    }));

    const store = new PostgresRecoveryStateStore({ client });
    const state = await store.load("tenant-1");

    expect(state).toEqual({
      tenantId: "tenant-1",
      sequence: 12,
      snapshot,
      updatedAt: "2026-09-13T10:00:00.000Z",
    });
  });

  it("persists sequence and snapshot atomically in one upsert", async () => {
    const calls: Array<{ text: string; values: readonly unknown[] }> = [];

    const client: PostgresRecoveryStateStoreClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        return { rows: [] };
      },
    };

    const store = new PostgresRecoveryStateStore({ client });

    await store.save({
      tenantId: "tenant-1",
      sequence: 20,
      snapshot,
      updatedAt: "2026-09-13T10:00:00.000Z",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.text).toContain("ON CONFLICT");
    expect(calls[0]?.values[0]).toBe("tenant-1");
    expect(calls[0]?.values[1]).toBe(20);
  });

  it("clears a tenant checkpoint", async () => {
    const calls: Array<{ text: string; values: readonly unknown[] }> = [];

    const client: PostgresRecoveryStateStoreClient = {
      async query(text, values = []) {
        calls.push({ text, values });
        return { rows: [] };
      },
    };

    const store = new PostgresRecoveryStateStore({ client });

    await store.clear("tenant-1");

    expect(calls[0]?.text).toContain("DELETE FROM");
    expect(calls[0]?.values).toEqual(["tenant-1"]);
  });
});

function createClient(
  handler: () => { rows: readonly unknown[] },
): PostgresRecoveryStateStoreClient {
  return {
    async query<TResult>() {
      return handler() as { rows: readonly TResult[] };
    },
  };
}
