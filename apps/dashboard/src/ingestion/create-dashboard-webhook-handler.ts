import type { HttpIngestionComposition, HttpWebhookResponse } from "@ci/runtime";

export interface DashboardWebhookHandlerOptions {
  readonly headers?: Readonly<Record<string, string>>;
}

export type DashboardWebhookHandler = (request: Request) => Promise<Response>;

export function createDashboardWebhookHandler(
  composition: HttpIngestionComposition,
  options: DashboardWebhookHandlerOptions = {},
): DashboardWebhookHandler {
  const headers = new Headers({
    "cache-control": "no-store",
    ...options.headers,
  });

  return async (request) => {
    const result = await composition.handle(request);

    return createResponse(result, headers);
  };
}

function createResponse(result: HttpWebhookResponse, baseHeaders: Headers): Response {
  const headers = new Headers(baseHeaders);
  headers.set("content-type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers,
  });
}
