import type { SimulationWorkerState } from "./simulation-worker-state";

export interface SimulationControllerState {
  worker: SimulationWorkerState;
  runtimeEventCount: number;
  runtime: unknown | null;
}

export const INITIAL_SIMULATION_CONTROLLER_STATE: SimulationControllerState = {
  worker: {
    status: "idle",
    requestId: null,
    progress: null,
    totalUsers: 0,
    totalChunks: 0,
    totalEvents: 0,
    errorMessage: null,
  },
  runtimeEventCount: 0,
  runtime: null,
};

export function reduceSimulationControllerState(
  state: SimulationControllerState,
  worker: SimulationWorkerState,
): SimulationControllerState {
  return {
    ...state,
    worker,
  };
}
