export interface SimulationProgress {
  chunkIndex: number;
  totalChunks: number;

  usersProcessed: number;
  totalUsers: number;

  eventsGenerated: number;
}

export type SimulationProgressListener = (progress: SimulationProgress) => void;
