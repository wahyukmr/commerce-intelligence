import { SimulationGenerator } from "../generator/simulation-generator";
import type {
  SimulationWorkerRequest,
  SimulationWorkerResponse,
} from "./simulation-worker-protocol";

export interface SimulationWorkerTransport {
  postMessage(message: SimulationWorkerResponse): void;
}

export class SimulationWorkerRunner {
  private activeRequestId: string | null = null;
  private cancelledRequests = new Set<string>();
  private readonly transport: SimulationWorkerTransport;

  constructor(transport: SimulationWorkerTransport) {
    this.transport = transport;
  }

  public async handle(request: SimulationWorkerRequest): Promise<void> {
    if (request.type === "simulation.cancel") {
      this.cancel(request.requestId);
      return;
    }

    if (this.activeRequestId !== null) {
      this.transport.postMessage({
        type: "simulation.error",
        requestId: request.requestId,
        message: "Another simulation request is already running.",
      });
      return;
    }

    this.activeRequestId = request.requestId;
    this.cancelledRequests.delete(request.requestId);

    try {
      const generator = new SimulationGenerator(request.config, request.scenario);

      let totalChunks = 0;
      let totalEvents = 0;
      let totalUsers = 0;

      for (const chunk of generator.generateChunks((progress) => {
        if (this.isCancelled(request.requestId)) {
          return;
        }

        this.transport.postMessage({
          type: "simulation.progress",
          requestId: request.requestId,
          progress,
        });
      })) {
        await Promise.resolve();

        if (this.isCancelled(request.requestId)) {
          this.transport.postMessage({
            type: "simulation.cancelled",
            requestId: request.requestId,
          });
          return;
        }

        totalChunks += 1;
        totalEvents += chunk.events.length;
        totalUsers = chunk.userEnd;

        this.transport.postMessage({
          type: "simulation.chunk",
          requestId: request.requestId,
          chunk,
        });
      }

      this.transport.postMessage({
        type: "simulation.complete",
        requestId: request.requestId,
        scale: request.scenario.scale,
        totalUsers,
        totalChunks,
        totalEvents,
      });
    } catch (error) {
      this.transport.postMessage({
        type: "simulation.error",
        requestId: request.requestId,
        message: error instanceof Error ? error.message : "Unknown simulation error",
      });
    } finally {
      this.cancelledRequests.delete(request.requestId);
      this.activeRequestId = null;
    }
  }

  private cancel(requestId: string): void {
    if (requestId !== this.activeRequestId) {
      return;
    }

    this.cancelledRequests.add(requestId);
  }

  private isCancelled(requestId: string): boolean {
    return this.cancelledRequests.has(requestId);
  }
}
