import { describe, expect, it, vi } from "vitest";
import { executeWithRetry, IngestionProcessingError } from "./ingestion-failure.js";

describe("executeWithRetry", () => {
  it("retries transient failures and returns the successful result", async () => {
    let attempts = 0;

    const result = await executeWithRetry(
      async () => {
        attempts += 1;

        if (attempts < 3) {
          throw new IngestionProcessingError("temporary failure", "transient");
        }

        return "ok";
      },
      {
        maxAttempts: 3,
        delayMs: () => 0,
        classify: (error) => ({
          retry: error instanceof IngestionProcessingError,
          kind: "transient",
          reason: "temporary",
        }),
      },
    );

    expect(result).toEqual({
      value: "ok",
      attempts: 3,
    });
  });

  it("does not retry permanent failures", async () => {
    const operation = vi.fn(async () => {
      throw new IngestionProcessingError("invalid event", "permanent");
    });

    await expect(
      executeWithRetry(operation, {
        maxAttempts: 5,
        delayMs: () => 0,
        classify: (error) => ({
          retry: false,
          kind: "permanent",
          reason: String(error),
        }),
      }),
    ).rejects.toThrow("invalid event");

    expect(operation).toHaveBeenCalledTimes(1);
  });
});
