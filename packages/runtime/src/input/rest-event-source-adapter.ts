import type { EventEnvelope } from "../contracts/event";
import type { EventIngestionHandler } from "./event-ingestion-handler";
import type { RestEventCursorStore } from "./rest-event-cursor-store";

export interface RestEventSourceResponse<TResponse> {
  readonly events: readonly TResponse[];
  readonly cursor?: string;
}

export interface RestEventSourceMapper<TResponse> {
  map(value: TResponse): EventEnvelope;
}

export interface RestEventSourceAdapterOptions<TResponse> {
  readonly endpoint: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly fetch?: typeof globalThis.fetch;
  readonly parseResponse?: (response: Response) => Promise<RestEventSourceResponse<TResponse>>;
  readonly mapper: RestEventSourceMapper<TResponse>;
  readonly pollIntervalMs?: number;
  readonly cursorStore?: RestEventCursorStore;
  readonly cursorKey?: string;
  readonly onPollError?: (error: unknown) => void | Promise<void>;
}

export interface RestEventSourcePullResult {
  readonly eventsRead: number;
  readonly eventsDelivered: number;
  readonly cursor?: string;
}

export interface RestEventSourceAdapter {
  readonly name: string;
  readonly running: boolean;
  start(handler: EventIngestionHandler): void;
  stop(): void;
  pull(): Promise<RestEventSourcePullResult>;
}

const DEFAULT_POLL_INTERVAL_MS = 30_000;

export class HttpRestEventSourceAdapter<TResponse> implements RestEventSourceAdapter {
  public readonly name = "http-rest-event-source";

  private readonly endpoint: string;
  private readonly headers: Readonly<Record<string, string>>;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly parseResponseImpl: (
    response: Response,
  ) => Promise<RestEventSourceResponse<TResponse>>;
  private readonly mapper: RestEventSourceMapper<TResponse>;
  private readonly pollIntervalMs: number;
  private readonly cursorStore: RestEventCursorStore | undefined;
  private readonly cursorKey: string;
  private readonly onPollError: ((error: unknown) => void | Promise<void>) | undefined;
  private cursorLoaded = false;
  private cursorLoad: Promise<void> | undefined;

  private handler: EventIngestionHandler | undefined;
  private timer: ReturnType<typeof setInterval> | undefined;
  private controller: AbortController | undefined;
  private cursor: string | undefined;
  private pulling = false;

  public constructor(options: RestEventSourceAdapterOptions<TResponse>) {
    if (!options.endpoint.trim()) {
      throw new Error("REST event source endpoint must be non-empty");
    }

    if (!options.mapper) {
      throw new Error("REST event source mapper is required");
    }

    const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;

    if (!Number.isFinite(pollIntervalMs) || pollIntervalMs <= 0) {
      throw new Error("pollIntervalMs must be greater than zero");
    }

    this.endpoint = options.endpoint;
    this.headers = options.headers ?? {};
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.parseResponseImpl = options.parseResponse ?? defaultParseResponse<TResponse>;
    this.mapper = options.mapper;
    this.pollIntervalMs = pollIntervalMs;
    this.cursorStore = options.cursorStore;
    this.cursorKey = options.cursorKey ?? options.endpoint;
    this.onPollError = options.onPollError;

    if (!this.cursorKey.trim()) {
      throw new Error("REST event source cursorKey must be non-empty");
    }
  }

  public get running(): boolean {
    return this.handler !== undefined;
  }

  public start(handler: EventIngestionHandler): void {
    if (this.running) {
      throw new Error("REST event source adapter already started");
    }

    this.handler = handler;
    this.controller = new AbortController();
    this.cursorLoaded = false;
    this.cursorLoad = undefined;

    this.timer = setInterval(() => {
      void this.runPullSafely();
    }, this.pollIntervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    this.controller?.abort();
    this.controller = undefined;
    this.handler = undefined;
  }

  public async pull(): Promise<RestEventSourcePullResult> {
    const handler = this.handler;

    if (!handler) {
      throw new Error("REST event source adapter is not started");
    }

    await this.ensureCursorLoaded();

    if (this.pulling) {
      return {
        eventsRead: 0,
        eventsDelivered: 0,
        cursor: this.cursor,
      };
    }

    this.pulling = true;

    try {
      const url = new URL(this.endpoint);

      if (this.cursor) {
        url.searchParams.set("cursor", this.cursor);
      }

      const response = await this.fetchImpl(url, {
        method: "GET",
        headers: this.headers,
        signal: this.controller?.signal,
      });

      if (!response.ok) {
        throw new Error(`REST event source request failed with status ${response.status}`);
      }

      const parsed = await this.parseResponseImpl(response);

      let delivered = 0;

      for (const value of parsed.events) {
        const event = this.mapper.map(value);
        await handler(event);
        delivered += 1;
      }

      if (parsed.cursor !== undefined) {
        if (this.cursorStore) {
          await this.cursorStore.save(this.cursorKey, parsed.cursor);
        }

        this.cursor = parsed.cursor;
      }

      return {
        eventsRead: parsed.events.length,
        eventsDelivered: delivered,
        cursor: this.cursor,
      };
    } finally {
      this.pulling = false;
    }
  }

  private async ensureCursorLoaded(): Promise<void> {
    if (!this.cursorStore || this.cursorLoaded) {
      return;
    }

    if (!this.cursorLoad) {
      this.cursorLoad = this.cursorStore.load(this.cursorKey).then((cursor) => {
        this.cursor = cursor;
        this.cursorLoaded = true;
      });
    }

    await this.cursorLoad;
  }

  private async runPullSafely(): Promise<void> {
    try {
      await this.pull();
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      await this.onPollError?.(error);
    }
  }
}

async function defaultParseResponse<TResponse>(
  response: Response,
): Promise<RestEventSourceResponse<TResponse>> {
  const body: unknown = await response.json();

  if (!body || typeof body !== "object") {
    throw new Error("REST event source response must be an object");
  }

  const record = body as Record<string, unknown>;
  const events = record.events;

  if (!Array.isArray(events)) {
    throw new Error("REST event source response.events must be an array");
  }

  const cursor = record.cursor;

  if (cursor !== undefined && typeof cursor !== "string") {
    throw new Error("REST event source response.cursor must be a string");
  }

  return {
    events: events as TResponse[],
    cursor,
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
