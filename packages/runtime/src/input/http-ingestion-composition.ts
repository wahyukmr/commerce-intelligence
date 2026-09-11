/// <reference lib="dom" />

import type { Runtime } from "../runtime/runtime.js";
import { createRuntimeIngestionHandler } from "./event-ingestion-handler.js";
import type { HttpWebhookAdapter, HttpWebhookResponse } from "./http-webhook-adapter.js";

export interface HttpIngestionComposition {
  readonly adapter: HttpWebhookAdapter;
  readonly handle: (request: Request) => Promise<HttpWebhookResponse>;
  readonly start: () => void;
  readonly stop: () => void;
}

export interface CreateHttpIngestionCompositionOptions {
  readonly adapter: HttpWebhookAdapter;
  readonly runtime: Runtime;
  readonly onAccepted?: Parameters<typeof createRuntimeIngestionHandler>[1] extends infer T
    ? T extends { onAccepted?: infer O }
      ? O
      : never
    : never;
  readonly onRejected?: Parameters<typeof createRuntimeIngestionHandler>[1] extends infer T
    ? T extends { onRejected?: infer O }
      ? O
      : never
    : never;
}

export function createHttpIngestionComposition({
  adapter,
  runtime,
  onAccepted,
  onRejected,
}: CreateHttpIngestionCompositionOptions): HttpIngestionComposition {
  let started = false;

  const handler = createRuntimeIngestionHandler(runtime, {
    onAccepted,
    onRejected,
  });

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
