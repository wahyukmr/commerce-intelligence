import {
  type CommerceQueryCompositionInput,
  createCommerceQueryComposition,
  createCommerceRuntimeComposition,
} from "@ci/commerce";
import type { Query } from "@ci/runtime";
import { CommerceDashboardQueryService } from "../services/dashboard-query-service";

export interface CreateDashboardCompositionOptions {
  readonly tenantId: string;
  readonly queries?: CommerceQueryCompositionInput;
}

export interface DashboardComposition {
  readonly runtime: ReturnType<typeof createCommerceRuntimeComposition>;
  readonly queryComposition: ReturnType<typeof createCommerceQueryComposition>;
  readonly queryService: CommerceDashboardQueryService;
}

/**
 * Application composition root for the dashboard.
 *
 * The dashboard chooses which query implementations to expose. The commerce
 * package owns commerce projection composition, while the runtime package
 * owns generic execution. No dashboard caller should assemble these pieces
 * independently.
 */
export function createDashboardComposition({
  tenantId,
  queries = {},
}: CreateDashboardCompositionOptions): DashboardComposition {
  const queryComposition = createCommerceQueryComposition(queries);
  const runtime = createCommerceRuntimeComposition({
    tenantId,
    queries: queryComposition.all,
  });
  const queryService = new CommerceDashboardQueryService(runtime, queryComposition);

  return Object.freeze({
    runtime,
    queryComposition,
    queryService,
  });
}

export type DashboardQueryInput = CommerceQueryCompositionInput;
export type DashboardQuery = Query;
