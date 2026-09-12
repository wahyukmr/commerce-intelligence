import type { EventEnvelope } from "../contracts/event";
import type { IngestionObserver } from "../input/ingestion-observer";
import type { IngestionOutcome } from "../input/ingestion-outcome";
import type { IngestionMetrics } from "./ingestion-metrics";

export function createMetricsIngestionObserver(metrics: IngestionMetrics): IngestionObserver {
  return {
    onReceived: () => {
      metrics.recordReceived();
    },
    onCompleted: (_event: EventEnvelope, _outcome: IngestionOutcome, observation) => {
      metrics.recordCompleted(observation);
    },
    onFailed: (_event, _error, observation) => {
      if (!observation.failureKind) {
        return;
      }

      metrics.recordFailed(observation, observation.failureKind);
    },
  };
}
