export interface ProjectionSnapshot {
  readonly name: string;
  readonly state: unknown;
}

export interface RuntimeSnapshot {
  readonly runtimeVersion: 1;
  readonly sequence: number;
  readonly eventCount: number;
  readonly tenantIds: readonly string[];
  readonly processedEventIds: readonly string[];
  readonly projections: readonly ProjectionSnapshot[];
}
