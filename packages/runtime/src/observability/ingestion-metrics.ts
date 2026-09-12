import type { IngestionFailureKind } from "../input/ingestion-failure";
import type { IngestionObservation } from "../input/ingestion-observer";

export interface IngestionMetricsSnapshot {
  readonly received: number;
  readonly accepted: number;
  readonly duplicates: number;
  readonly failed: number;
  readonly transientFailures: number;
  readonly permanentFailures: number;
  readonly totalProcessingTimeMs: number;
  readonly averageProcessingTimeMs: number;
  readonly maxProcessingTimeMs: number;
}

export interface IngestionMetrics {
  recordReceived(): void;
  recordCompleted(observation: IngestionObservation): void;
  recordFailed(observation: IngestionObservation, kind: IngestionFailureKind): void;
  snapshot(): IngestionMetricsSnapshot;
  reset(): void;
}

export class InMemoryIngestionMetrics implements IngestionMetrics {
  private received = 0;
  private accepted = 0;
  private duplicates = 0;
  private failed = 0;
  private transientFailures = 0;
  private permanentFailures = 0;
  private totalProcessingTimeMs = 0;
  private maxProcessingTimeMs = 0;

  public recordReceived(): void {
    this.received += 1;
  }

  public recordCompleted(observation: IngestionObservation): void {
    if (observation.status === "accepted") {
      this.accepted += 1;
    } else {
      this.duplicates += 1;
    }

    this.recordDuration(observation.durationMs);
  }

  public recordFailed(observation: IngestionObservation, kind: IngestionFailureKind): void {
    this.failed += 1;

    if (kind === "transient") {
      this.transientFailures += 1;
    } else {
      this.permanentFailures += 1;
    }

    this.recordDuration(observation.durationMs);
  }

  public snapshot(): IngestionMetricsSnapshot {
    const completed = this.accepted + this.duplicates + this.failed;

    return {
      received: this.received,
      accepted: this.accepted,
      duplicates: this.duplicates,
      failed: this.failed,
      transientFailures: this.transientFailures,
      permanentFailures: this.permanentFailures,
      totalProcessingTimeMs: this.totalProcessingTimeMs,
      averageProcessingTimeMs: completed === 0 ? 0 : this.totalProcessingTimeMs / completed,
      maxProcessingTimeMs: this.maxProcessingTimeMs,
    };
  }

  public reset(): void {
    this.received = 0;
    this.accepted = 0;
    this.duplicates = 0;
    this.failed = 0;
    this.transientFailures = 0;
    this.permanentFailures = 0;
    this.totalProcessingTimeMs = 0;
    this.maxProcessingTimeMs = 0;
  }

  private recordDuration(durationMs: number): void {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      return;
    }

    this.totalProcessingTimeMs += durationMs;
    this.maxProcessingTimeMs = Math.max(this.maxProcessingTimeMs, durationMs);
  }
}
