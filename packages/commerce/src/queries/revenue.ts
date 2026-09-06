import type { Query, QueryContext, RuntimeSnapshot } from "@ci/runtime";

import type { RevenueProjectionState } from "../domain/revenue.js";

export interface RevenueSummaryQueryInput {
  readonly includeRefunds?: boolean;
}

export interface RevenueSummary {
  readonly currency: string | null;
  readonly paidOrderCount: number;
  readonly grossRevenue: number;
  readonly refundCount: number;
  readonly refundedRevenue: number;
  readonly netRevenue: number;
}

function getRevenueState(snapshot: RuntimeSnapshot): RevenueProjectionState {
  const projection = snapshot.projections.find((item) => item.name === "commerce.revenue");

  if (!projection) {
    throw new Error('Required projection "commerce.revenue" is not available.');
  }

  return projection.state as RevenueProjectionState;
}

export class RevenueSummaryQuery
  implements Query<RevenueSummaryQueryInput | undefined, RevenueSummary>
{
  readonly name = "commerce.revenue.summary";

  execute(
    snapshot: RuntimeSnapshot,
    input: RevenueSummaryQueryInput | undefined,
    _context: QueryContext,
  ): RevenueSummary {
    const state = getRevenueState(snapshot);

    const includeRefunds = input?.includeRefunds ?? true;

    if (includeRefunds) {
      return {
        currency: state.currency,
        paidOrderCount: state.paidOrderCount,
        grossRevenue: state.grossRevenue,
        refundCount: state.refundCount,
        refundedRevenue: state.refundedRevenue,
        netRevenue: state.netRevenue,
      };
    }

    return {
      currency: state.currency,
      paidOrderCount: state.paidOrderCount,
      grossRevenue: state.grossRevenue,
      refundCount: 0,
      refundedRevenue: 0,
      netRevenue: state.grossRevenue,
    };
  }
}
