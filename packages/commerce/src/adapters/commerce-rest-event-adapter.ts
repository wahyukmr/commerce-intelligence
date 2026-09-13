import type { EventEnvelope } from "@ci/runtime";
import {
  HttpRestEventSourceAdapter,
  type RestEventCursorStore,
  type RestEventSourceAdapter,
} from "@ci/runtime";

export interface CommerceRestEventRecord {
  readonly id: string;
  readonly type: string;
  readonly version?: number;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly payload: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CommerceRestEventAdapterOptions {
  readonly endpoint: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly fetch?: typeof globalThis.fetch;
  readonly pollIntervalMs?: number;
  readonly cursorStore?: RestEventCursorStore;
  readonly cursorKey?: string;
  readonly onPollError?: (error: unknown) => void | Promise<void>;
  readonly parseResponse?: ConstructorParameters<
    typeof HttpRestEventSourceAdapter<CommerceRestEventRecord>
  >[0]["parseResponse"];
}

export function createCommerceRestEventAdapter(
  options: CommerceRestEventAdapterOptions,
): RestEventSourceAdapter {
  return new HttpRestEventSourceAdapter<CommerceRestEventRecord>({
    endpoint: options.endpoint,
    headers: options.headers,
    fetch: options.fetch,
    pollIntervalMs: options.pollIntervalMs,
    cursorStore: options.cursorStore,
    cursorKey: options.cursorKey,
    onPollError: options.onPollError,
    parseResponse: options.parseResponse,
    mapper: {
      map: toEventEnvelope,
    },
  });
}

function toEventEnvelope(record: CommerceRestEventRecord): EventEnvelope {
  return {
    id: record.id,
    type: record.type,
    version: record.version ?? 1,
    occurredAt: record.occurredAt,
    tenantId: record.tenantId,
    payload: record.payload,
    metadata: record.metadata,
  };
}
