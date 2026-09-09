import type { CommerceDashboardQueryService } from "./dashboard-query-service";

export interface DashboardQueryRef<TInput = unknown, TResult = unknown> {
  readonly name: string;
  readonly execute: (service: CommerceDashboardQueryService, input: TInput) => TResult;
}

export function defineDashboardQueryRef<TInput, TResult>(
  name: string,
): DashboardQueryRef<TInput, TResult> {
  if (name.trim().length === 0) {
    throw new Error("Dashboard query name must not be empty.");
  }

  return Object.freeze({
    name,
    execute: (service: CommerceDashboardQueryService, input: TInput) =>
      service.execute<TInput, TResult>(name, input),
  });
}
