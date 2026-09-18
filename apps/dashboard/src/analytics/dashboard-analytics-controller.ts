import type { DashboardPagedQueryRef } from "./dashboard-paged-query-ref";
import type { DashboardPageRequest } from "./dashboard-pagination";
import type { DashboardQueryRef } from "./dashboard-query-ref";
import type { CommerceDashboardQueryService } from "./dashboard-query-service";

export interface DashboardAnalyticsController {
  execute<TInput, TResult>(query: DashboardQueryRef<TInput, TResult>, input: TInput): TResult;

  executePage<TInput, TResult>(
    query: DashboardPagedQueryRef<TInput, TResult>,
    input: TInput,
    page: DashboardPageRequest,
  ): TResult;
}

export class DefaultDashboardAnalyticsController implements DashboardAnalyticsController {
  private readonly queryService: CommerceDashboardQueryService;

  constructor(queryService: CommerceDashboardQueryService) {
    this.queryService = queryService;
  }

  public execute<TInput, TResult>(
    query: DashboardQueryRef<TInput, TResult>,
    input: TInput,
  ): TResult {
    return query.execute(this.queryService, input);
  }

  public executePage<TInput, TResult>(
    query: DashboardPagedQueryRef<TInput, TResult>,
    input: TInput,
    page: DashboardPageRequest,
  ): TResult {
    return query.execute(this.queryService, input, page);
  }
}
