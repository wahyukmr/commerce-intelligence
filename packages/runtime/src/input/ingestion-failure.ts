export type IngestionFailureKind = "transient" | "permanent";

export class IngestionProcessingError extends Error {
  public readonly kind: IngestionFailureKind;
  public readonly cause: unknown;

  public constructor(message: string, kind: IngestionFailureKind, cause?: unknown) {
    super(message);
    this.name = "IngestionProcessingError";
    this.kind = kind;
    this.cause = cause;
  }
}

export interface IngestionRetryDecision {
  readonly retry: boolean;
  readonly kind: IngestionFailureKind;
  readonly reason: string;
}

export interface IngestionRetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: (attempt: number) => number;
  readonly classify: (error: unknown) => IngestionRetryDecision;
}

export interface RetryExecutionResult<T> {
  readonly value: T;
  readonly attempts: number;
}

export const defaultIngestionRetryPolicy: IngestionRetryPolicy = {
  maxAttempts: 3,
  delayMs: (attempt) => Math.min(1000 * 2 ** (attempt - 1), 10_000),
  classify: (error) => {
    if (error instanceof IngestionProcessingError) {
      return {
        retry: error.kind === "transient",
        kind: error.kind,
        reason: error.message,
      };
    }

    return {
      retry: false,
      kind: "permanent",
      reason: error instanceof Error ? error.message : "Unknown ingestion error",
    };
  },
};

export async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  policy: IngestionRetryPolicy = defaultIngestionRetryPolicy,
): Promise<RetryExecutionResult<T>> {
  if (!Number.isInteger(policy.maxAttempts) || policy.maxAttempts < 1) {
    throw new Error("Ingestion retry maxAttempts must be a positive integer");
  }

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      return {
        value: await operation(attempt),
        attempts: attempt,
      };
    } catch (error) {
      const decision = policy.classify(error);

      if (!decision.retry || attempt >= policy.maxAttempts) {
        throw error;
      }

      const delayMs = policy.delayMs(attempt);

      if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new Error("Ingestion retry delay must be a finite non-negative number");
      }

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  throw new Error("Ingestion retry exhausted");
}

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
