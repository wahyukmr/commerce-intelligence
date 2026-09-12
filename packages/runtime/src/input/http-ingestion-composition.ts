/// <reference lib="dom" />

import type { Runtime } from "../runtime/runtime";
import {
  createRuntimeIngestionHandler,
  type RuntimeIngestionHandlerOptions,
} from "./event-ingestion-handler";
import type { HttpWebhookAdapter, HttpWebhookResponse } from "./http-webhook-adapter";

export interface HttpIngestionComposition {
  readonly adapter: HttpWebhookAdapter;
  readonly handle: (request: Request) => Promise<HttpWebhookResponse>;
  readonly start: () => void;
  readonly stop: () => void;
}

export interface CreateHttpIngestionCompositionOptions {
  readonly adapter: HttpWebhookAdapter;
  readonly runtime: Runtime;
  readonly ingestion?: RuntimeIngestionHandlerOptions;
}

export function createHttpIngestionComposition({
  adapter,
  runtime,
  ingestion,
}: CreateHttpIngestionCompositionOptions): HttpIngestionComposition {
  let started = false;

  const handler = createRuntimeIngestionHandler(runtime, ingestion);

  return {
    adapter,
    handle: (request) => adapter.handle(request),
    start: () => {
      if (started) {
        return;
      }

      adapter.start(handler);
      started = true;
    },
    stop: () => {
      if (!started) {
        return;
      }

      adapter.stop();
      started = false;
    },
  };
}
