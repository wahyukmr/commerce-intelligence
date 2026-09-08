import { createCommerceQueryComposition } from "@ci/commerce";

import { Runtime } from "@ci/runtime";
import { describe, expect, it, vi } from "vitest";
import { createDashboardComposition } from "../runtime/create-dashboard-composition";
import { CommerceDashboardQueryService } from "../services/dashboard-query-service";
import { useSimulation } from "./use-simulation";

describe("useSimulation", () => {
  it("exports the dashboard simulation controller", () => {
    expect(useSimulation).toEqual(expect.any(Function));
  });

  it("uses the dashboard composition as its resource factory", () => {
    const createComposition = vi.fn(() => createDashboardComposition({ tenantId: "test" }));

    const composition = createComposition();

    expect(createComposition).toHaveBeenCalledTimes(1);
    expect(composition.runtime).toBeInstanceOf(Runtime);
    expect(composition.queryComposition).toEqual(createCommerceQueryComposition());
    expect(composition.queryService).toBeInstanceOf(CommerceDashboardQueryService);
  });
});
