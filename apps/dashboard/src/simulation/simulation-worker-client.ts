import type {
  SimulationChunk,
  SimulationConfig,
  SimulationProgress,
  SimulationScenario,
  SimulationWorkerResponse,
} from "@ci/simulation";

import {
  INITIAL_SIMULATION_WORKER_STATE,
  reduceSimulationWorkerState,
  type SimulationWorkerState,
  type SimulationWorkerStateListener,
} from "./simulation-worker-state";

interface WorkerLike {
  addEventListener(type: "message", listener: (event: MessageEvent) => void): void;

  addEventListener(type: "error", listener: (event: ErrorEvent) => void): void;

  removeEventListener(type: "message", listener: (event: MessageEvent) => void): void;

  removeEventListener(type: "error", listener: (event: ErrorEvent) => void): void;

  postMessage(message: unknown): void;
  terminate(): void;
}

export interface SimulationWorkerClientHandlers {
  onProgress?: (progress: SimulationProgress) => void;
  onChunk?: (chunk: SimulationChunk) => void;
  onComplete?: (result: SimulationCompleteResult) => void;
  onCancelled?: () => void;
  onError?: (error: Error) => void;
}

export interface SimulationCompleteResult {
  totalUsers: number;
  totalChunks: number;
  totalEvents: number;
}

export interface SimulationWorkerClientOptions {
  createWorker: () => WorkerLike;
  createRequestId?: () => string;
}

export class SimulationWorkerClient {
  private readonly worker: WorkerLike;
  private readonly createRequestId: () => string;
  private readonly listeners = new Set<SimulationWorkerStateListener>();

  private readonly onMessageBound: (event: MessageEvent) => void;
  private readonly onErrorBound: (event: ErrorEvent) => void;

  private state: SimulationWorkerState = INITIAL_SIMULATION_WORKER_STATE;

  private handlers: SimulationWorkerClientHandlers = {};

  constructor(options: SimulationWorkerClientOptions) {
    this.worker = options.createWorker();
    this.createRequestId = options.createRequestId ?? defaultRequestId;

    this.onMessageBound = (event) => {
      this.handleMessage(event.data as SimulationWorkerResponse);
    };

    this.onErrorBound = (event) => {
      const error = new Error(event.message || "Simulation worker failed.");

      this.transitionError(error);
    };

    this.worker.addEventListener("message", this.onMessageBound);

    this.worker.addEventListener("error", this.onErrorBound);
  }

  public getState(): SimulationWorkerState {
    return this.state;
  }

  public subscribe(listener: SimulationWorkerStateListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public start(
    config: SimulationConfig,
    scenario: SimulationScenario,
    handlers: SimulationWorkerClientHandlers = {},
  ): string {
    if (this.state.status === "running") {
      throw new Error("A simulation is already running.");
    }

    const requestId = this.createRequestId();

    this.handlers = handlers;

    this.state = {
      ...INITIAL_SIMULATION_WORKER_STATE,
      status: "running",
      requestId,
    };

    this.emit();

    this.worker.postMessage({
      type: "simulation.start",
      requestId,
      config,
      scenario,
    });

    return requestId;
  }

  public cancel(): void {
    if (this.state.status !== "running") {
      return;
    }

    const requestId = this.state.requestId;

    if (requestId === null) {
      return;
    }

    this.worker.postMessage({
      type: "simulation.cancel",
      requestId,
    });
  }

  public reset(): void {
    if (this.state.status === "running") {
      throw new Error("Cannot reset while a simulation is running.");
    }

    this.handlers = {};
    this.state = INITIAL_SIMULATION_WORKER_STATE;
    this.emit();
  }

  public dispose(): void {
    this.worker.removeEventListener("message", this.onMessageBound);

    this.worker.removeEventListener("error", this.onErrorBound);

    this.worker.terminate();
    this.listeners.clear();
  }

  private handleMessage(message: SimulationWorkerResponse): void {
    if (this.state.requestId !== message.requestId) {
      return;
    }

    this.state = reduceSimulationWorkerState(this.state, message);

    switch (message.type) {
      case "simulation.progress":
        this.handlers.onProgress?.(message.progress);
        break;

      case "simulation.chunk":
        this.handlers.onChunk?.(message.chunk);
        break;

      case "simulation.complete":
        this.handlers.onComplete?.({
          totalUsers: message.totalUsers,
          totalChunks: message.totalChunks,
          totalEvents: message.totalEvents,
        });
        break;

      case "simulation.cancelled":
        this.handlers.onCancelled?.();
        break;

      case "simulation.error":
        this.handlers.onError?.(new Error(message.message));
        break;
    }

    if (
      message.type === "simulation.complete" ||
      message.type === "simulation.cancelled" ||
      message.type === "simulation.error"
    ) {
      this.handlers = {};
    }

    this.emit();
  }

  private transitionError(error: Error): void {
    if (this.state.requestId === null) {
      return;
    }

    this.state = {
      ...this.state,
      status: "error",
      errorMessage: error.message,
    };

    const handler = this.handlers.onError;

    this.handlers = {};

    handler?.(error);
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

function defaultRequestId(): string {
  return `simulation-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
