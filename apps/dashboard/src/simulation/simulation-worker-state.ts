import type { SimulationWorkerResponse } from "@ci/simulation";

export type SimulationWorkerStatus = "idle" | "running" | "completed" | "cancelled" | "error";

export interface SimulationWorkerState {
  status: SimulationWorkerStatus;
  requestId: string | null;
  progress: SimulationWorkerResponse extends never
    ? never
    : Extract<SimulationWorkerResponse, { type: "simulation.progress" }>["progress"] | null;
  totalUsers: number;
  totalChunks: number;
  totalEvents: number;
  errorMessage: string | null;
}

export const INITIAL_SIMULATION_WORKER_STATE: SimulationWorkerState = {
  status: "idle",
  requestId: null,
  progress: null,
  totalUsers: 0,
  totalChunks: 0,
  totalEvents: 0,
  errorMessage: null,
};

export type SimulationWorkerStateListener = (state: SimulationWorkerState) => void;

export function reduceSimulationWorkerState(
  state: SimulationWorkerState,
  message: SimulationWorkerResponse,
): SimulationWorkerState {
  if (state.requestId !== null && message.requestId !== state.requestId) {
    return state;
  }

  switch (message.type) {
    case "simulation.progress":
      return {
        ...state,
        status: "running",
        requestId: message.requestId,
        progress: message.progress,
        errorMessage: null,
      };

    case "simulation.complete":
      return {
        ...state,
        status: "completed",
        requestId: message.requestId,
        totalUsers: message.totalUsers,
        totalChunks: message.totalChunks,
        totalEvents: message.totalEvents,
        errorMessage: null,
      };

    case "simulation.cancelled":
      return {
        ...state,
        status: "cancelled",
        requestId: message.requestId,
        errorMessage: null,
      };

    case "simulation.error":
      return {
        ...state,
        status: "error",
        requestId: message.requestId,
        errorMessage: message.message,
      };

    case "simulation.chunk":
      return state;
  }
}
