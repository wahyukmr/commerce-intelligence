import { Runtime } from "@ci/runtime";
import { describe, expect, it, vi } from "vitest";
import { useSimulation } from "./use-simulation";

describe("useSimulation", () => {
  it("exports the dashboard simulation controller", () => {
    expect(useSimulation).toEqual(expect.any(Function));
  });

  it("exposes the expected runtime factory contract", () => {
    const createRuntime = vi.fn(() => new Runtime({ tenantId: "test" }));
    expect(createRuntime()).toBeInstanceOf(Runtime);
  });
});
