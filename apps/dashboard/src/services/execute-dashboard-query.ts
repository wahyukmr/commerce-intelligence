import type { DashboardQueryRef } from "./dashboard-query-ref";
import type { CommerceDashboardQueryService } from "./dashboard-query-service";

/**
 * Canonical dashboard read helper.
 *
 * Feature code passes a typed query reference instead of a raw query name.
 * Query execution remains owned by CommerceDashboardQueryService.
 */
export function executeDashboardQuery<TInput, TResult>(
  service: CommerceDashboardQueryService,
  ref: DashboardQueryRef<TInput, TResult>,
  input: TInput,
): TResult {
  return ref.execute(service, input);
}
