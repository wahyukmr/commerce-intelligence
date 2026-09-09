import type { CommerceQueryCompositionInput } from "@ci/commerce";
import type { Runtime } from "@ci/runtime";
import {
  createDashboardComposition,
  type DashboardComposition,
} from "./create-dashboard-composition";

export interface CreateDashboardRuntimeOptions {
  readonly tenantId: string;
  readonly queries?: CommerceQueryCompositionInput;
}

/**
 * Compatibility helper for callers that need the runtime only.
 * New dashboard application code should use createDashboardComposition().
 */
export function createRuntime({ tenantId, queries = {} }: CreateDashboardRuntimeOptions): Runtime {
  return createDashboardComposition({ tenantId, queries }).runtime;
}

export function createDashboardRuntimeComposition(
  options: CreateDashboardRuntimeOptions,
): DashboardComposition {
  return createDashboardComposition(options);
}
