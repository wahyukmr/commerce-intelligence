import type { Runtime } from "@ci/runtime";

import type {
  SimulationChunk,
  SimulationConfig,
  SimulationProgress,
  SimulationScenario,
} from "@ci/simulation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  createWorker: ConstructorParameters<typeof SimulationWorkerClient>[0]["createWorker"];
  createRuntime: () => Runtime;
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
  const runtimeRef = useRef<Runtime | null>(null);
  const handlersRef = useRef(handlers);

  const [state, setState] = useState<SimulationControllerState>(
    INITIAL_SIMULATION_CONTROLLER_STATE,
  );

  handlersRef.current = handlers;

  if (workerRef.current === null) {
    workerRef.current = new SimulationWorkerClient({
      createWorker: options.createWorker,
    });
  }

  if (runtimeRef.current === null) {
    runtimeRef.current = options.createRuntime();
  }

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    return worker.subscribe((workerState) => {
      setState((current) => ({
        ...reduceSimulationControllerState(current, workerState),
        runtime: runtimeRef.current,
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
    const runtime = runtimeRef.current;
    const worker = workerRef.current;

    if (!runtime || !worker) {
      throw new Error("Simulation resources are not initialized.");
    }

    runtime.reset();
    setState(INITIAL_SIMULATION_CONTROLLER_STATE);

    const workerHandlers: SimulationWorkerClientHandlers = {
      onProgress: (progress) => {
        handlersRef.current.onProgress?.(progress);
      },
      onChunk: (chunk) => {
        runtime.ingest(chunk.events);
        handlersRef.current.onChunk?.(chunk);

        setState((current) => ({
          ...current,
          runtimeEventCount: runtime.eventCount,
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
    runtimeRef.current?.reset();
    setState(INITIAL_SIMULATION_CONTROLLER_STATE);
  }, []);

  const query = useCallback(<TResult = unknown, TInput = unknown>(name: string, input: TInput) => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      throw new Error("Simulation runtime is not initialized.");
    }

    return runtime.query(name, input) as TResult;
  }, []);

  const snapshot = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      throw new Error("Simulation runtime is not initialized.");
    }

    return runtime.snapshot();
  }, []);

  return {
    state,
    start,
    cancel,
    reset,
    query,
    snapshot,
  };
}
