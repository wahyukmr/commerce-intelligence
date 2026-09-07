import { describe, expect, it } from "vitest";
import type { SimulationConfig } from "../config/simulation-config";
import type { SimulationScenario } from "../config/simulation-scenario";
import type { SimulationWorkerResponse } from "./simulation-worker-protocol";
import { SimulationWorkerRunner } from "./simulation-worker-runner";

const config = {
  tenantId: "worker-test",
  seed: 7,
  totalUsers: 20,
  days: 7,
  startAt: "2026-01-01T00:00:00.000Z",
  products: [
    { id: "product-1", price: 10 },
    { id: "product-2", price: 20 },
  ],
  features: [],
  personaDistribution: {
    dropOff: 0.3,
    activated: 0.3,
    engaged: 0.25,
    power: 0.15,
  },
  chunkSize: 5,
} satisfies SimulationConfig;

const scenario = {
  name: "worker-test",
  scale: {
    name: "small" as const,
    totalUsers: 20,
    days: 7,
    chunkSize: 5,
  },
  behavior: {
    personaDistribution: config.personaDistribution,
    sessionCount: {
      dropOff: [1, 1] as const,
      activated: [1, 1] as const,
      engaged: [1, 1] as const,
      power: [1, 1] as const,
    },
    productViewCount: {
      dropOff: [1, 1] as const,
      activated: [1, 1] as const,
      engaged: [1, 1] as const,
      power: [1, 1] as const,
    },
    cartProbability: { dropOff: 0, activated: 0, engaged: 0, power: 0 },
    checkoutProbability: { dropOff: 0, activated: 0, engaged: 0, power: 0 },
    purchaseProbability: { dropOff: 0, activated: 0, engaged: 0, power: 0 },
    cancellationProbability: 0,
    refundProbability: 0,
    refundPartialProbability: 0,
  },
} satisfies SimulationScenario;

describe("SimulationWorkerRunner", () => {
  it("streams progress, chunks, and completion", async () => {
    const messages: SimulationWorkerResponse[] = [];
    const runner = new SimulationWorkerRunner({
      postMessage: (message) => messages.push(message),
    });

    await runner.handle({
      type: "simulation.start",
      requestId: "request-1",
      config,
      scenario,
    });

    expect(messages.some((message) => message.type === "simulation.progress")).toBe(true);
    expect(messages.some((message) => message.type === "simulation.chunk")).toBe(true);
    expect(messages.at(-1)?.type).toBe("simulation.complete");
  });

  it("supports cooperative cancellation", async () => {
    const messages: SimulationWorkerResponse[] = [];
    const runner = new SimulationWorkerRunner({
      postMessage: (message) => messages.push(message),
    });

    const runPromise = runner.handle({
      type: "simulation.start",
      requestId: "request-1",
      config,
      scenario,
    });

    runner.handle({
      type: "simulation.cancel",
      requestId: "request-1",
    });

    await runPromise;

    expect(messages.at(-1)).toEqual({
      type: "simulation.cancelled",
      requestId: "request-1",
    });
  });
});
