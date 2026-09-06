import type { Query, QueryContext, RuntimeSnapshot } from "@ci/runtime";

import type {
  FunnelConversion,
  FunnelCounts,
  FunnelProjectionState,
  FunnelStage,
} from "../domain/funnel.js";

export interface FunnelQueryInput {
  readonly sessionId?: string;
}

export interface FunnelSummary {
  readonly counts: FunnelCounts;
  readonly conversions: readonly FunnelConversion[];
}

function getFunnelState(snapshot: RuntimeSnapshot): FunnelProjectionState {
  const projection = snapshot.projections.find((item) => item.name === "commerce.funnel");

  if (!projection) {
    throw new Error('Required projection "commerce.funnel" is not available.');
  }

  return projection.state as FunnelProjectionState;
}

function conversionRate(from: number, to: number): number {
  if (from === 0) {
    return 0;
  }

  return to / from;
}

function createConversions(counts: FunnelCounts): readonly FunnelConversion[] {
  const stagePairs = [
    ["sessionStarted", "productViewed"],
    ["productViewed", "cartItemAdded"],
    ["cartItemAdded", "checkoutStarted"],
    ["checkoutStarted", "orderPaid"],
  ] as const satisfies ReadonlyArray<readonly [FunnelStage, FunnelStage]>;

  return stagePairs.map(([fromStage, toStage]) => {
    const countFrom = counts[fromStage];
    const countTo = counts[toStage];

    return {
      from: fromStage,
      to: toStage,
      countFrom,
      countTo,
      rate: conversionRate(countFrom, countTo),
    };
  });
}

export class FunnelSummaryQuery implements Query<FunnelQueryInput | undefined, FunnelSummary> {
  readonly name = "commerce.funnel.summary";

  execute(
    snapshot: RuntimeSnapshot,
    _input: FunnelQueryInput | undefined,
    _context: QueryContext,
  ): FunnelSummary {
    const state = getFunnelState(snapshot);

    return {
      counts: state.counts,
      conversions: createConversions(state.counts),
    };
  }
}

export class FunnelSessionQuery
  implements Query<{ readonly sessionId: string }, FunnelProjectionState["sessions"][string] | null>
{
  readonly name = "commerce.funnel.session";

  execute(
    snapshot: RuntimeSnapshot,
    input: {
      readonly sessionId: string;
    },
    _context: QueryContext,
  ): FunnelProjectionState["sessions"][string] | null {
    const state = getFunnelState(snapshot);

    return state.sessions[input.sessionId] ?? null;
  }
}
