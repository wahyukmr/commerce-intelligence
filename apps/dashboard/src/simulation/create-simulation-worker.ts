import type { SimulationWorkerClientOptions } from "./simulation-worker-client";

export function createSimulationWorkerOptions(): Pick<
  SimulationWorkerClientOptions,
  "createWorker"
> {
  return {
    createWorker: () =>
      new Worker(new URL("../workers/simulation.worker.ts", import.meta.url), { type: "module" }),
  };
}
