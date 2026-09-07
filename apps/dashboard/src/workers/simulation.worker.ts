import { type SimulationWorkerRequest, SimulationWorkerRunner } from "@ci/simulation";

const runner = new SimulationWorkerRunner({
  postMessage: (message) => self.postMessage(message),
});

self.onmessage = (event: MessageEvent<SimulationWorkerRequest>) => {
  void runner.handle(event.data);
};
