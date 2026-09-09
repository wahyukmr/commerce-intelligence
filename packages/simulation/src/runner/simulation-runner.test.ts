import {
  CustomerAnalyticsProjection,
  CustomerProjection,
  FunnelProjection,
  OrderProjection,
  ProductAnalyticsProjection,
  RetentionProjection,
  RevenueProjection,
  type RevenueSummary,
  RevenueSummaryQuery,
  SessionBehaviorProjection,
} from "@ci/commerce";
import { Runtime } from "@ci/runtime";
import { describe, expect, it } from "vitest";

import { getSimulationScenario } from "../config/simulation-profiles.js";

import { SimulationRunner } from "./simulation-runner.js";

const config = {
  tenantId: "tenant-test",
  seed: 99,
  totalUsers: 25,
  days: 30,
  startAt: "2026-01-01T00:00:00.000Z",
  products: [
    {
      id: "product-1",
      price: 100_000,
    },
    {
      id: "product-2",
      price: 200_000,
    },
    {
      id: "product-3",
      price: 300_000,
    },
  ],
  features: [],
  personaDistribution: {
    dropOff: 0.25,
    activated: 0.25,
    engaged: 0.3,
    power: 0.2,
  },
  chunkSize: 5,
} as const;

function createRuntime(): Runtime {
  const runtime = new Runtime({
    tenantId: config.tenantId,
  });

  runtime.registerProjection(new CustomerProjection());

  runtime.registerProjection(new CustomerAnalyticsProjection());

  runtime.registerProjection(new OrderProjection());

  runtime.registerProjection(new RevenueProjection());

  runtime.registerProjection(new ProductAnalyticsProjection());

  runtime.registerProjection(new SessionBehaviorProjection());

  runtime.registerProjection(new FunnelProjection());

  runtime.registerProjection(new RetentionProjection());

  runtime.registerQuery(new RevenueSummaryQuery());

  return runtime;
}

describe("SimulationRunner", () => {
  it("feeds simulation chunks into the runtime", () => {
    const runtime = createRuntime();

    const runner = new SimulationRunner(runtime, config, getSimulationScenario("small"));

    const result = runner.run();

    expect(result.totalUsers).toBe(25);

    expect(result.totalChunks).toBe(5);

    expect(result.totalEvents).toBeGreaterThan(25);

    expect(runtime.eventCount).toBe(result.totalEvents);
  });

  it("emits progress chunks", () => {
    const runtime = createRuntime();

    const chunks: number[] = [];

    const runner = new SimulationRunner(runtime, config, getSimulationScenario("small"));

    runner.run({
      onProgress: (progress) => {
        chunks.push(progress.chunkIndex);
      },
    });

    expect(chunks).toEqual([0, 1, 2, 3, 4]);
  });

  it("produces analytics data in the runtime", () => {
    const runtime = createRuntime();

    const runner = new SimulationRunner(runtime, config, getSimulationScenario("small"));

    runner.run();

    const revenue = runtime.query<undefined, RevenueSummary>("commerce.revenue.summary", undefined);

    expect(revenue.currency).toBe("IDR");

    expect(revenue.paidOrderCount).toBeGreaterThan(0);

    expect(revenue.grossRevenue).toBeGreaterThan(0);
  });

  it("produces funnel data in the runtime", () => {
    const runtime = createRuntime();

    const runner = new SimulationRunner(runtime, config, getSimulationScenario("small"));

    runner.run();

    const funnel = runtime
      .snapshot()
      .projections.find((projection) => projection.name === "commerce.funnel");

    expect(funnel).toBeDefined();
  });

  it("is deterministic for identical simulation configuration", () => {
    const firstRuntime = createRuntime();

    const secondRuntime = createRuntime();

    new SimulationRunner(firstRuntime, config, getSimulationScenario("small")).run();

    new SimulationRunner(secondRuntime, config, getSimulationScenario("small")).run();

    expect(firstRuntime.snapshot()).toEqual(secondRuntime.snapshot());
  });
});
