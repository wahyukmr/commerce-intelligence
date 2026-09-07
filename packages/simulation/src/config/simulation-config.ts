export type UserPersona = "dropOff" | "activated" | "engaged" | "power";

export interface ProductConfig {
  readonly id: string;
  readonly price: number;
}

export interface PersonaDistribution {
  readonly dropOff: number;
  readonly activated: number;
  readonly engaged: number;
  readonly power: number;
}

export interface SimulationConfig {
  readonly tenantId: string;
  readonly seed: number;
  readonly totalUsers: number;
  readonly days: number;
  readonly startAt: string;
  readonly products: readonly ProductConfig[];
  readonly features: readonly string[];
  readonly personaDistribution: PersonaDistribution;
  readonly chunkSize: number;
}
