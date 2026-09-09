import type { SimulationConfig } from "../config/simulation-config";
import type { SimulationProgress } from "../config/simulation-progress";
import type { SimulationScaleProfile, SimulationScenario } from "../config/simulation-scenario";
import type { SimulationChunk } from "../generator/simulation-generator";

export type SimulationWorkerStartRequest = {
  type: "simulation.start";
  requestId: string;
  config: SimulationConfig;
  scenario: SimulationScenario;
};

export type SimulationWorkerCancelRequest = {
  type: "simulation.cancel";
  requestId: string;
};

export type SimulationWorkerRequest = SimulationWorkerStartRequest | SimulationWorkerCancelRequest;

export type SimulationWorkerProgressMessage = {
  type: "simulation.progress";
  requestId: string;
  progress: SimulationProgress;
};

export type SimulationWorkerChunkMessage = {
  type: "simulation.chunk";
  requestId: string;
  chunk: SimulationChunk;
};

export type SimulationWorkerCompleteMessage = {
  type: "simulation.complete";
  requestId: string;
  scale: SimulationScaleProfile;
  totalUsers: number;
  totalChunks: number;
  totalEvents: number;
};

export type SimulationWorkerCancelledMessage = {
  type: "simulation.cancelled";
  requestId: string;
};

export type SimulationWorkerErrorMessage = {
  type: "simulation.error";
  requestId: string;
  message: string;
};

export type SimulationWorkerResponse =
  | SimulationWorkerProgressMessage
  | SimulationWorkerChunkMessage
  | SimulationWorkerCompleteMessage
  | SimulationWorkerCancelledMessage
  | SimulationWorkerErrorMessage;
