import type { Runtime } from "@ci/runtime";

import type {
  SimulationChunk,
  SimulationConfig,
  SimulationProgress,
  SimulationScenario,
} from "@ci/simulation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardComposition } from "../runtime";
import {
  INITIAL_SIMULATION_CONTROLLER_STATE,
  reduceSimulationControllerState,
  type SimulationControllerState,
} from "./simulation-controller-state";
import {
  SimulationWorkerClient,
  type SimulationWorkerClientHandlers,
} from "./simulation-worker-client";

export interface UseSimulationOptions {
  readonly createWorker: ConstructorParameters<typeof SimulationWorkerClient>[0]["createWorker"];
  /**
   * Application-owned dashboard composition.
   *
   * The hook consumes this instance and never creates or replaces it.
   */
  readonly composition: DashboardComposition;
}

export interface SimulationControllerHandlers {
  onChunk?: (chunk: SimulationChunk) => void;
  onProgress?: (progress: SimulationProgress) => void;
}

export interface UseSimulationResult {
  state: SimulationControllerState;
  start: (config: SimulationConfig, scenario: SimulationScenario) => void;
  cancel: () => void;
  reset: () => void;
  query: <TResult = unknown, TInput = unknown>(name: string, input: TInput) => TResult;
  snapshot: () => ReturnType<Runtime["snapshot"]>;
}

export function useSimulation(
  options: UseSimulationOptions,
  handlers: SimulationControllerHandlers = {},
): UseSimulationResult {
  const workerRef = useRef<SimulationWorkerClient | null>(null);
  const compositionRef = useRef(options.composition);
  const handlersRef = useRef(handlers);

  const [state, setState] = useState<SimulationControllerState>(
    INITIAL_SIMULATION_CONTROLLER_STATE,
  );

  if (compositionRef.current !== options.composition) {
    throw new Error("Dashboard composition must remain stable for the lifetime of useSimulation.");
  }

  handlersRef.current = handlers;

  if (workerRef.current === null) {
    workerRef.current = new SimulationWorkerClient({
      createWorker: options.createWorker,
    });
  }

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    return worker.subscribe((workerState) => {
      setState((current) => ({
        ...reduceSimulationControllerState(current, workerState),
        runtime: compositionRef.current.runtime,
      }));
    });
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.dispose();
      workerRef.current = null;
    };
  }, []);

  const start = useCallback((config: SimulationConfig, scenario: SimulationScenario) => {
    const composition = compositionRef.current;
    const worker = workerRef.current;

    if (!worker) {
      throw new Error("Simulation worker is not initialized.");
    }

    composition.runtime.reset();
    setState(INITIAL_SIMULATION_CONTROLLER_STATE);

    const workerHandlers: SimulationWorkerClientHandlers = {
      onProgress: (progress) => {
        handlersRef.current.onProgress?.(progress);
      },
      onChunk: (chunk) => {
        composition.runtime.ingest(chunk.events);
        handlersRef.current.onChunk?.(chunk);

        setState((current) => ({
          ...current,
          runtimeEventCount: composition.runtime.eventCount,
        }));
      },
    };

    worker.start(config, scenario, workerHandlers);
  }, []);

  const cancel = useCallback(() => {
    workerRef.current?.cancel();
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.reset();
    compositionRef.current.runtime.reset();
    setState(INITIAL_SIMULATION_CONTROLLER_STATE);
  }, []);

  const query = useCallback(
    <TResult = unknown, TInput = unknown>(name: string, input: TInput) =>
      compositionRef.current.queryService.execute<TInput, TResult>(name, input),
    [],
  );

  const snapshot = useCallback(() => compositionRef.current.runtime.snapshot(), []);

  return {
    state,
    start,
    cancel,
    reset,
    query,
    snapshot,
  };
}
