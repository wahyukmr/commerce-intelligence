import type {
  SimulationBehaviorProfile,
  SimulationScaleProfile,
  SimulationScenario,
} from "./simulation-scenario";

const defaultBehavior: SimulationBehaviorProfile = {
  personaDistribution: {
    dropOff: 0.3,
    activated: 0.3,
    engaged: 0.25,
    power: 0.15,
  },

  sessionCount: {
    dropOff: [1, 2],
    activated: [1, 3],
    engaged: [2, 5],
    power: [4, 8],
  },

  productViewCount: {
    dropOff: [1, 4],
    activated: [2, 8],
    engaged: [4, 15],
    power: [8, 25],
  },

  cartProbability: {
    dropOff: 0.01,
    activated: 0.08,
    engaged: 0.22,
    power: 0.45,
  },

  checkoutProbability: {
    dropOff: 0,
    activated: 0.08,
    engaged: 0.32,
    power: 0.62,
  },

  purchaseProbability: {
    dropOff: 0,
    activated: 0.1,
    engaged: 0.45,
    power: 0.72,
  },

  cancellationProbability: 0.035,
  refundProbability: 0.08,
  refundPartialProbability: 0.65,
};

export const SIMULATION_SCALE_PROFILES: Record<
  SimulationScaleProfile["name"],
  SimulationScaleProfile
> = {
  small: {
    name: "small",
    totalUsers: 5_000,
    days: 30,
    chunkSize: 250,
  },

  medium: {
    name: "medium",
    totalUsers: 10_000,
    days: 30,
    chunkSize: 500,
  },

  large: {
    name: "large",
    totalUsers: 100_000,
    days: 90,
    chunkSize: 1_000,
  },
};

export const SIMULATION_SCENARIOS: Record<SimulationScaleProfile["name"], SimulationScenario> = {
  small: {
    name: "small-commerce",
    scale: SIMULATION_SCALE_PROFILES.small,
    behavior: defaultBehavior,
  },

  medium: {
    name: "medium-commerce",
    scale: SIMULATION_SCALE_PROFILES.medium,
    behavior: defaultBehavior,
  },

  large: {
    name: "large-commerce",
    scale: SIMULATION_SCALE_PROFILES.large,
    behavior: defaultBehavior,
  },
};

export function getSimulationScenario(name: SimulationScaleProfile["name"]): SimulationScenario {
  return SIMULATION_SCENARIOS[name];
}
