import { PostgresEventStore, type PostgresEventStoreClient } from "./postgres-event-store";

export interface CreatePostgresEventStoreOptions {
  readonly client: PostgresEventStoreClient;
  readonly tableName?: string;
}

export function createPostgresEventStore({
  client,
  tableName,
}: CreatePostgresEventStoreOptions): PostgresEventStore {
  return new PostgresEventStore({
    client,
    tableName,
  });
}
