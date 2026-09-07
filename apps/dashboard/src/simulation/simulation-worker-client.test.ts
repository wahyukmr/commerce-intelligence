import type { SimulationChunk, SimulationConfig, SimulationScenario } from "@ci/simulation";
import { describe, expect, it, vi } from "vitest";
import { SimulationWorkerClient } from "./simulation-worker-client";
import { INITIAL_SIMULATION_WORKER_STATE } from "./simulation-worker-state";

class FakeWorker {
  public readonly postMessage = vi.fn();
  public readonly terminate = vi.fn();

  private readonly messageListeners = new Set<(event: MessageEvent) => void>();

  private readonly errorListeners = new Set<(event: ErrorEvent) => void>();

  public addEventListener(type: "message", listener: (event: MessageEvent) => void): void;

  public addEventListener(type: "error", listener: (event: ErrorEvent) => void): void;

  public addEventListener(
    type: "message" | "error",
    listener: ((event: MessageEvent) => void) | ((event: ErrorEvent) => void),
  ): void {
    if (type === "message") {
      this.messageListeners.add(listener as (event: MessageEvent) => void);
      return;
    }

    this.errorListeners.add(listener as (event: ErrorEvent) => void);
  }

  public removeEventListener(type: "message", listener: (event: MessageEvent) => void): void;

  public removeEventListener(type: "error", listener: (event: ErrorEvent) => void): void;

  public removeEventListener(
    type: "message" | "error",
    listener: ((event: MessageEvent) => void) | ((event: ErrorEvent) => void),
  ): void {
    if (type === "message") {
      this.messageListeners.delete(listener as (event: MessageEvent) => void);
      return;
    }

    this.errorListeners.delete(listener as (event: ErrorEvent) => void);
  }

  public emitMessage(data: unknown): void {
    const event = { data } as MessageEvent;

    for (const listener of this.messageListeners) {
      listener(event);
    }
  }

  public emitError(message: string): void {
    const event = { message } as ErrorEvent;

    for (const listener of this.errorListeners) {
      listener(event);
    }
  }
}

const config = {
  tenantId: "test",
  seed: 1,
  totalUsers: 100,
  days: 30,
  startAt: "2026-01-01T00:00:00.000Z",
  products: [{ id: "product-1", price: 100 }],
  features: [],
  personaDistribution: {
    dropOff: 0.3,
    activated: 0.3,
    engaged: 0.25,
    power: 0.15,
  },
  chunkSize: 10,
} satisfies SimulationConfig;

const scenario = {
  name: "test",
  scale: {
    name: "small",
    totalUsers: 100,
    days: 30,
    chunkSize: 10,
  },
  behavior: {
    personaDistribution: config.personaDistribution,
    sessionCount: {
      dropOff: [1, 1],
      activated: [1, 1],
      engaged: [1, 1],
      power: [1, 1],
    },
    productViewCount: {
      dropOff: [1, 1],
      activated: [1, 1],
      engaged: [1, 1],
      power: [1, 1],
    },
    cartProbability: {
      dropOff: 0,
      activated: 0,
      engaged: 0,
      power: 0,
    },
    checkoutProbability: {
      dropOff: 0,
      activated: 0,
      engaged: 0,
      power: 0,
    },
    purchaseProbability: {
      dropOff: 0,
      activated: 0,
      engaged: 0,
      power: 0,
    },
    cancellationProbability: 0,
    refundProbability: 0,
    refundPartialProbability: 0,
  },
} satisfies SimulationScenario;

function createClient(worker: FakeWorker, requestId = "request-1"): SimulationWorkerClient {
  return new SimulationWorkerClient({
    createWorker: () => worker,
    createRequestId: () => requestId,
  });
}

function createProgress() {
  return {
    chunkIndex: 0,
    totalChunks: 10,
    usersProcessed: 10,
    totalUsers: 100,
    eventsGenerated: 20,
  };
}

function createCompleteMessage(requestId: string) {
  return {
    type: "simulation.complete" as const,
    requestId,
    scale: scenario.scale,
    totalUsers: 100,
    totalChunks: 10,
    totalEvents: 250,
  };
}

describe("SimulationWorkerClient", () => {
  describe("start", () => {
    it("starts a simulation and sends the start message", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-1");

      const states: string[] = [];

      client.subscribe((state) => {
        states.push(state.status);
      });

      const requestId = client.start(config, scenario);

      expect(requestId).toBe("request-1");

      expect(client.getState()).toMatchObject({
        status: "running",
        requestId: "request-1",
      });

      expect(worker.postMessage).toHaveBeenCalledWith({
        type: "simulation.start",
        requestId: "request-1",
        config,
        scenario,
      });

      expect(states).toEqual(["running"]);
    });

    it("uses a generated request id when no custom factory is provided", () => {
      const worker = new FakeWorker();

      const client = new SimulationWorkerClient({
        createWorker: () => worker,
      });

      const requestId = client.start(config, scenario);

      expect(requestId).toMatch(/^simulation-\d+-[a-z0-9]+$/);
      expect(client.getState().requestId).toBe(requestId);
    });

    it("rejects concurrent starts", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-2");

      client.start(config, scenario);

      expect(() => {
        client.start(config, scenario);
      }).toThrow("A simulation is already running.");

      expect(worker.postMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe("progress", () => {
    it("forwards progress and keeps the simulation running", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-progress");

      const onProgress = vi.fn();

      client.start(config, scenario, {
        onProgress,
      });

      const progress = createProgress();

      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-progress",
        progress,
      });

      expect(onProgress).toHaveBeenCalledTimes(1);
      expect(onProgress).toHaveBeenCalledWith(progress);

      expect(client.getState()).toMatchObject({
        status: "running",
        requestId: "request-progress",
      });
    });

    it("ignores progress from a stale request", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-current");

      const onProgress = vi.fn();

      client.start(config, scenario, {
        onProgress,
      });

      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-stale",
        progress: createProgress(),
      });

      expect(onProgress).not.toHaveBeenCalled();

      expect(client.getState()).toMatchObject({
        status: "running",
        requestId: "request-current",
      });
    });
  });

  describe("chunk", () => {
    it("forwards simulation chunks", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-chunk");

      const chunk = {
        chunkIndex: 0,
        userStart: 0,
        userEnd: 10,
        events: [],
      } satisfies SimulationChunk;

      const onChunk = vi.fn();

      client.start(config, scenario, {
        onChunk,
      });

      worker.emitMessage({
        type: "simulation.chunk",
        requestId: "request-chunk",
        chunk,
      });

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith(chunk);

      expect(client.getState().status).toBe("running");
    });
  });

  describe("complete", () => {
    it("forwards the completion result and transitions to completed", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-complete");

      const onComplete = vi.fn();

      client.start(config, scenario, {
        onComplete,
      });

      worker.emitMessage(createCompleteMessage("request-complete"));

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({
        totalUsers: 100,
        totalChunks: 10,
        totalEvents: 250,
      });

      expect(client.getState()).toMatchObject({
        status: "completed",
        requestId: "request-complete",
        totalUsers: 100,
        totalChunks: 10,
        totalEvents: 250,
      });
    });

    it("clears handlers after completion", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-complete-handlers");

      const onProgress = vi.fn();
      const onComplete = vi.fn();

      client.start(config, scenario, {
        onProgress,
        onComplete,
      });

      worker.emitMessage(createCompleteMessage("request-complete-handlers"));

      expect(onComplete).toHaveBeenCalledTimes(1);

      /*
       * A terminal response clears handlers.
       * This verifies that the callbacks are not retained.
       */
      client.reset();

      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-complete-handlers",
        progress: createProgress(),
      });

      expect(onProgress).not.toHaveBeenCalled();
    });
  });

  describe("cancel", () => {
    it("sends a cancel message for the active request", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-cancel");

      client.start(config, scenario);

      client.cancel();

      expect(worker.postMessage).toHaveBeenLastCalledWith({
        type: "simulation.cancel",
        requestId: "request-cancel",
      });

      expect(client.getState().status).toBe("running");
    });

    it("transitions to cancelled when the worker confirms cancellation", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-cancelled");

      const onCancelled = vi.fn();

      client.start(config, scenario, {
        onCancelled,
      });

      client.cancel();

      worker.emitMessage({
        type: "simulation.cancelled",
        requestId: "request-cancelled",
      });

      expect(onCancelled).toHaveBeenCalledTimes(1);

      expect(client.getState()).toMatchObject({
        status: "cancelled",
        requestId: "request-cancelled",
      });
    });

    it("does nothing when there is no running simulation", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-cancel-idle");

      client.cancel();

      expect(worker.postMessage).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("handles a simulation.error response", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-error-response");

      const onError = vi.fn();

      client.start(config, scenario, {
        onError,
      });

      worker.emitMessage({
        type: "simulation.error",
        requestId: "request-error-response",
        message: "Simulation failed.",
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Simulation failed.",
        }),
      );

      expect(client.getState()).toMatchObject({
        status: "error",
        requestId: "request-error-response",
        errorMessage: "Simulation failed.",
      });
    });

    it("handles a worker-level error", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-worker-error");

      const onError = vi.fn();

      client.start(config, scenario, {
        onError,
      });

      worker.emitError("Worker crashed.");

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Worker crashed.",
        }),
      );

      expect(client.getState()).toMatchObject({
        status: "error",
        requestId: "request-worker-error",
        errorMessage: "Worker crashed.",
      });
    });

    it("ignores worker errors when there is no active request", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-idle-error");

      const onError = vi.fn();

      /*
       * There is no active request because start() was never called.
       * The client has no handler registered either.
       */
      worker.emitError("Worker crashed.");

      expect(onError).not.toHaveBeenCalled();

      expect(client.getState()).toEqual(INITIAL_SIMULATION_WORKER_STATE);
    });
  });

  describe("subscription", () => {
    it("notifies subscribers when state changes", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-subscribe");

      const listener = vi.fn();

      client.subscribe(listener);

      client.start(config, scenario);

      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-subscribe",
        progress: createProgress(),
      });

      expect(listener).toHaveBeenCalledTimes(2);

      expect(listener).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          status: "running",
          requestId: "request-subscribe",
        }),
      );

      expect(listener).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          status: "running",
          requestId: "request-subscribe",
        }),
      );
    });

    it("stops notifying a listener after unsubscribe", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-unsubscribe");

      const listener = vi.fn();

      const unsubscribe = client.subscribe(listener);

      client.start(config, scenario);

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-unsubscribe",
        progress: createProgress(),
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("resets the client after a completed simulation", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-reset");

      client.start(config, scenario);

      worker.emitMessage(createCompleteMessage("request-reset"));

      expect(client.getState().status).toBe("completed");

      client.reset();

      expect(client.getState()).toEqual(INITIAL_SIMULATION_WORKER_STATE);
    });

    it("rejects reset while a simulation is running", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-reset-running");

      client.start(config, scenario);

      expect(() => {
        client.reset();
      }).toThrow("Cannot reset while a simulation is running.");
    });

    it("allows a new simulation after reset", () => {
      const worker = new FakeWorker();

      let requestId = "request-first";

      const client = new SimulationWorkerClient({
        createWorker: () => worker,
        createRequestId: () => requestId,
      });

      client.start(config, scenario);

      worker.emitMessage(createCompleteMessage("request-first"));

      client.reset();

      requestId = "request-second";

      const secondRequestId = client.start(config, scenario);

      expect(secondRequestId).toBe("request-second");

      expect(worker.postMessage).toHaveBeenLastCalledWith({
        type: "simulation.start",
        requestId: "request-second",
        config,
        scenario,
      });

      expect(client.getState()).toMatchObject({
        status: "running",
        requestId: "request-second",
      });
    });
  });

  describe("dispose", () => {
    it("removes worker listeners and terminates the worker", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-dispose");

      const removeSpy = vi.spyOn(worker, "removeEventListener");

      client.dispose();

      expect(removeSpy).toHaveBeenCalledTimes(2);
      expect(removeSpy).toHaveBeenCalledWith("message", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("error", expect.any(Function));

      expect(worker.terminate).toHaveBeenCalledTimes(1);
    });

    it("stops handling worker messages after dispose", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-dispose-events");

      const onProgress = vi.fn();

      client.start(config, scenario, {
        onProgress,
      });

      client.dispose();

      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-dispose-events",
        progress: createProgress(),
      });

      expect(onProgress).not.toHaveBeenCalled();
    });

    it("clears state listeners on dispose", () => {
      const worker = new FakeWorker();
      const client = createClient(worker, "request-dispose-state");

      const listener = vi.fn();

      client.subscribe(listener);

      client.start(config, scenario);

      expect(listener).toHaveBeenCalledTimes(1);

      client.dispose();

      /*
       * Worker listeners have been removed, so there is no external
       * event that can cause emit(). We verify the observable behavior
       * through the worker event path.
       */
      worker.emitMessage({
        type: "simulation.progress",
        requestId: "request-dispose-state",
        progress: createProgress(),
      });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
