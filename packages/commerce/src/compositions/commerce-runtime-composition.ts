import type { Query } from "@ci/runtime";
import { Runtime } from "@ci/runtime";
import { CustomerAnalyticsProjection } from "../projections/customer-analytics-projection";
import { CustomerProjection } from "../projections/customer-projection";
import { FunnelProjection } from "../projections/funnel-projection";
import { OrderProjection } from "../projections/order-projection";
import { ProductAnalyticsProjection } from "../projections/product-analytics-projection";
import { RetentionProjection } from "../projections/retention-projection";
import { RevenueProjection } from "../projections/revenue-projection";
import { SessionBehaviorProjection } from "../projections/session-behavior-projection";

export interface CreateCommerceRuntimeCompositionOptions {
  tenantId: string;
  queries?: readonly Query[];
}

/**
 * Builds the canonical V1 commerce runtime composition.
 *
 * Projection composition belongs to @ci/commerce so every consumer shares the
 * same state model. Query implementations remain injectable because queries
 * are deliberately read-side contracts and may be composed differently by an
 * application without duplicating projections.
 */
export function createCommerceRuntimeComposition(
  options: CreateCommerceRuntimeCompositionOptions,
): Runtime {
  const runtime = new Runtime({ tenantId: options.tenantId });

  runtime.registerProjection(new CustomerProjection());
  runtime.registerProjection(new OrderProjection());
  runtime.registerProjection(new RevenueProjection());
  runtime.registerProjection(new CustomerAnalyticsProjection());
  runtime.registerProjection(new ProductAnalyticsProjection());
  runtime.registerProjection(new SessionBehaviorProjection());
  runtime.registerProjection(new FunnelProjection());
  runtime.registerProjection(new RetentionProjection());

  for (const query of options.queries ?? []) {
    runtime.registerQuery(query);
  }

  return runtime;
}
