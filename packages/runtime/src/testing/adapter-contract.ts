import type { EventEnvelope } from "../contracts/event";
import type { EventIngestionHandler } from "../input/event-ingestion-handler";
import type { RestEventSourceAdapter } from "../input/rest-event-source-adapter";

export interface AdapterContractTestContext {
  readonly adapter: RestEventSourceAdapter;
  readonly createHandler: (received: EventEnvelope[]) => EventIngestionHandler;
}

export async function assertSourceAdapterContract(
  context: AdapterContractTestContext,
): Promise<void> {
  const received: EventEnvelope[] = [];
  const handler = context.createHandler(received);

  expectContractStartStop(context.adapter, handler);

  if (context.adapter.running) {
    context.adapter.stop();
  }
}

function expectContractStartStop(
  adapter: RestEventSourceAdapter,
  handler: EventIngestionHandler,
): void {
  adapter.start(handler);

  if (!adapter.running) {
    throw new Error("Adapter contract failed: adapter did not start");
  }

  let secondStartFailed = false;

  try {
    adapter.start(handler);
  } catch {
    secondStartFailed = true;
  }

  if (!secondStartFailed) {
    throw new Error("Adapter contract failed: adapter allowed duplicate start");
  }

  adapter.stop();

  if (adapter.running) {
    throw new Error("Adapter contract failed: adapter did not stop");
  }
}
