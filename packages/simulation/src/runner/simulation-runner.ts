import type { Runtime } from "@ci/runtime";
import type { SimulationConfig } from "../config/simulation-config";
import type { SimulationProgressListener } from "../config/simulation-progress";
import type { SimulationScenario } from "../config/simulation-scenario";
import { type SimulationChunk, SimulationGenerator } from "../generator/simulation-generator";

export interface SimulationRunResult {
  totalUsers: number;
  totalChunks: number;
  totalEvents: number;
  snapshot: ReturnType<Runtime["snapshot"]>;
}

export interface SimulationRunOptions {
  onProgress?: SimulationProgressListener;
  signal?: {
    readonly aborted: boolean;
  };
}

export class SimulationRunner {
  private readonly generator: SimulationGenerator;
  private readonly runtime: Runtime;

  constructor(runtime: Runtime, config: SimulationConfig, scenario: SimulationScenario) {
    this.runtime = runtime;
    this.generator = new SimulationGenerator(config, scenario);
  }

  public run(options: SimulationRunOptions = {}): SimulationRunResult {
    let totalChunks = 0;
    let totalEvents = 0;
    let totalUsers = 0;

    for (const chunk of this.generator.generateChunks(options.onProgress)) {
      this.throwIfAborted(options.signal);

      this.ingestChunk(chunk);

      totalChunks += 1;
      totalEvents += chunk.events.length;
      totalUsers = chunk.userEnd;
    }

    return {
      totalUsers,
      totalChunks,
      totalEvents,
      snapshot: this.runtime.snapshot(),
    };
  }

  private ingestChunk(chunk: SimulationChunk): void {
    this.runtime.ingest(chunk.events);
  }

  private throwIfAborted(signal?: { readonly aborted: boolean }): void {
    if (signal?.aborted) {
      throw new Error("Simulation aborted");
    }
  }
}
