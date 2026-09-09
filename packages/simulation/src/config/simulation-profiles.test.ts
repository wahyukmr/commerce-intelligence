import { describe, expect, it } from "vitest";
import { getSimulationScenario, SIMULATION_SCALE_PROFILES } from "./simulation-profiles";

describe("simulation scale profiles", () => {
  it("defines the locked scale profiles", () => {
    expect(SIMULATION_SCALE_PROFILES.small.totalUsers).toBe(5_000);

    expect(SIMULATION_SCALE_PROFILES.medium.totalUsers).toBe(10_000);

    expect(SIMULATION_SCALE_PROFILES.large.totalUsers).toBe(100_000);
  });

  it("returns a valid scenario", () => {
    const scenario = getSimulationScenario("medium");

    expect(scenario.name).toBe("medium-commerce");
    expect(scenario.scale.totalUsers).toBe(10_000);
  });
});
