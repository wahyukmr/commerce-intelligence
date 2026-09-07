import {
  CustomerAnalyticsProjection,
  CustomerProjection,
  FunnelProjection,
  OrderProjection,
  ProductAnalyticsProjection,
  RetentionProjection,
  RevenueProjection,
  SessionBehaviorProjection,
} from "@ci/commerce";

import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";
import type { SimulationConfig } from "../config/simulation-config";
import { getSimulationScenario } from "../config/simulation-profiles";
import { SimulationGenerator } from "../generator/simulation-generator";

const config: SimulationConfig = {
  tenantId: "simulation-integration",
  seed: 9001,
  totalUsers: 100,
  days: 30,
  startAt: "2026-01-01T00:00:00.000Z",
  chunkSize: 20,
  products: [
    { id: "product-1", price: 100 },
    { id: "product-2", price: 200 },
    { id: "product-3", price: 300 },
  ],
  features: [],
  personaDistribution: {
    dropOff: 0.3,
    activated: 0.3,
    engaged: 0.25,
    power: 0.15,
  },
};

describe("simulation runtime integration", () => {
  it("ingests generated commerce events through the real projections", () => {
    const runtime = new Runtime({
      tenantId: config.tenantId,
    });

    runtime.registerProjection(new CustomerProjection());
    runtime.registerProjection(new OrderProjection());
    runtime.registerProjection(new RevenueProjection());
    runtime.registerProjection(new CustomerAnalyticsProjection());
    runtime.registerProjection(new ProductAnalyticsProjection());
    runtime.registerProjection(new SessionBehaviorProjection());
    runtime.registerProjection(new FunnelProjection());
    runtime.registerProjection(new RetentionProjection());

    const generator = new SimulationGenerator(config, getSimulationScenario("small"));

    let generatedEvents = 0;

    for (const chunk of generator.generateChunks()) {
      runtime.ingest(chunk.events);
      generatedEvents += chunk.events.length;
    }

    expect(generatedEvents).toBeGreaterThan(0);
    expect(runtime.eventCount).toBe(generatedEvents);
    expect(runtime.sequence).toBe(generatedEvents);
    expect(runtime.projectionNames).toHaveLength(8);
  });
});
