import type { DashboardPage, DashboardPageRequest } from "./dashboard-pagination";
import type { CommerceDashboardQueryService } from "./dashboard-query-service";

export interface DashboardPagedQueryRef<TInput, TResult> {
  readonly name: string;
  readonly execute: (
    service: CommerceDashboardQueryService,
    input: TInput,
    page: DashboardPageRequest,
  ) => TResult;
}

export function defineDashboardPagedQueryRef<TInput, TResult>(
  name: string,
): DashboardPagedQueryRef<TInput, TResult> {
  if (name.trim().length === 0) {
    throw new Error("Dashboard paged query name must not be empty.");
  }

  return Object.freeze({
    name,
    execute: (service: CommerceDashboardQueryService, input: TInput, page: DashboardPageRequest) =>
      service.executePage<TInput, TResult>(name, input, page),
  });
}

export type DashboardPagedResult<TItem> = DashboardPage<TItem>;
