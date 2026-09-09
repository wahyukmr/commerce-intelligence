import type { PersonaDistribution, SimulationConfig, UserPersona } from "./simulation-config";

export interface SimulationBehaviorProfile {
  personaDistribution: PersonaDistribution;

  sessionCount: Record<UserPersona, readonly [number, number]>;
  productViewCount: Record<UserPersona, readonly [number, number]>;

  cartProbability: Record<UserPersona, number>;
  checkoutProbability: Record<UserPersona, number>;
  purchaseProbability: Record<UserPersona, number>;

  cancellationProbability: number;
  refundProbability: number;
  refundPartialProbability: number;
}

export interface SimulationScaleProfile {
  name: "small" | "medium" | "large";
  totalUsers: number;
  days: number;
  chunkSize: number;
}

export interface SimulationScenario {
  name: string;
  scale: SimulationScaleProfile;
  behavior: SimulationBehaviorProfile;
}

export interface ResolvedSimulationScenario extends Omit<SimulationScenario, "scale"> {
  scale: SimulationScaleProfile;
}

export function resolveScenario(
  baseConfig: SimulationConfig,
  scenario: SimulationScenario,
): SimulationConfig {
  return {
    ...baseConfig,
    totalUsers: scenario.scale.totalUsers,
    days: scenario.scale.days,
    chunkSize: scenario.scale.chunkSize,
    personaDistribution: scenario.behavior.personaDistribution,
  };
}
