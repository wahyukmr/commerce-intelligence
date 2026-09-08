import { describe, expect, it, vi } from "vitest";

import { createDashboardComposition } from "../runtime/create-dashboard-composition";
import { useSimulation } from "./use-simulation";

describe("useSimulation", () => {
  it("exports the dashboard simulation controller", () => {
    expect(useSimulation).toEqual(expect.any(Function));
  });

  it("accepts an application-owned composition", () => {
    const composition = createDashboardComposition({ tenantId: "test" });
    const options = {
      createWorker: vi.fn(),
      composition,
    };

    expect(options.composition).toBe(composition);
  });

  it("does not define a composition factory in its public options", () => {
    const composition = createDashboardComposition({ tenantId: "test" });
    const options = {
      createWorker: vi.fn(),
      composition,
    };

    expect("createComposition" in options).toBe(false);
  });
});
