import { describe, expect, it } from "vitest";
import type { SimulationConfig } from "../config/simulation-config";
import { getSimulationScenario } from "../config/simulation-profiles";
import type { SimulationProgress } from "../config/simulation-progress";
import { SimulationGenerator } from "./simulation-generator";

const config: SimulationConfig = {
  tenantId: "test-tenant",
  seed: 42,
  totalUsers: 100,
  days: 30,
  startAt: "2026-01-01T00:00:00.000Z",
  products: [
    {
      id: "product-1",
      price: 100,
    },
    {
      id: "product-2",
      price: 200,
    },
  ],
  features: [],
  personaDistribution: {
    dropOff: 0.3,
    activated: 0.3,
    engaged: 0.25,
    power: 0.15,
  },
  chunkSize: 25,
};

describe("SimulationGenerator", () => {
  it("is deterministic for the same seed", () => {
    const scenario = getSimulationScenario("small");

    const first = new SimulationGenerator(config, scenario).generateAll();

    const second = new SimulationGenerator(config, scenario).generateAll();

    expect(first).toEqual(second);
  });

  it("produces causally ordered lifecycle events", () => {
    const scenario = getSimulationScenario("small");

    const result = new SimulationGenerator(config, scenario).generateAll();

    const byOrder = new Map<
      string,
      { placed?: string; paid?: string; cancelled?: string; refunded?: string }
    >();

    for (const event of result.events) {
      if (
        event.type === "order.placed" ||
        event.type === "order.paid" ||
        event.type === "order.cancelled" ||
        event.type === "refund.issued"
      ) {
        const orderId =
          event.type === "refund.issued" ? event.payload.orderId : event.payload.orderId;

        const state = byOrder.get(orderId) ?? {};

        if (event.type === "order.placed") {
          state.placed = event.occurredAt;
        }

        if (event.type === "order.paid") {
          state.paid = event.occurredAt;
        }

        if (event.type === "order.cancelled") {
          state.cancelled = event.occurredAt;
        }

        if (event.type === "refund.issued") {
          state.refunded = event.occurredAt;
        }

        byOrder.set(orderId, state);
      }
    }

    for (const state of byOrder.values()) {
      if (state.placed && state.paid) {
        expect(Date.parse(state.paid)).toBeGreaterThan(Date.parse(state.placed));
      }

      if (state.placed && state.cancelled) {
        expect(Date.parse(state.cancelled)).toBeGreaterThan(Date.parse(state.placed));
      }

      if (state.paid && state.refunded) {
        expect(Date.parse(state.refunded)).toBeGreaterThan(Date.parse(state.paid));
      }
    }
  });

  it("emits progress monotonically", () => {
    const scenario = getSimulationScenario("small");

    const progress: SimulationProgress[] = [];

    const generator = new SimulationGenerator(config, scenario);

    [
      ...generator.generateChunks((value) => {
        progress.push(value);
      }),
    ];

    expect(progress.length).toBeGreaterThan(0);

    for (let index = 1; index < progress.length; index += 1) {
      const current = progress[index];
      const previous = progress[index - 1];

      if (!current || !previous) {
        continue;
      }

      expect(current.usersProcessed).toBeGreaterThanOrEqual(previous.usersProcessed);

      expect(current.eventsGenerated).toBeGreaterThanOrEqual(previous.eventsGenerated);
    }
  });
});
