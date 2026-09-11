import type { Runtime } from "@ci/runtime";
import {
  createHttpIngestionComposition,
  type HttpIngestionComposition,
  HttpWebhookAdapter,
  type HttpWebhookAdapterOptions,
} from "@ci/runtime";

export interface CreateDashboardIngestionOptions {
  readonly runtime: Runtime;
  readonly webhook?: HttpWebhookAdapterOptions;
}

export function createDashboardIngestion({
  runtime,
  webhook,
}: CreateDashboardIngestionOptions): HttpIngestionComposition {
  const adapter = new HttpWebhookAdapter({
    name: "dashboard-commerce-webhook",
    method: "POST",
    path: "/webhooks/commerce",
    ...webhook,
  });

  return createHttpIngestionComposition({
    adapter,
    runtime,
  });
}
