import type { Projection, ProjectionContext } from "@ci/runtime";
import type { RevenueProjectionState } from "../domain/revenue.js";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";

export class RevenueProjection implements Projection<RevenueProjectionState> {
  readonly name = "commerce.revenue";

  createInitialState(_context: ProjectionContext): RevenueProjectionState {
    return {
      currency: null,
      paidOrderCount: 0,
      grossRevenue: 0,
      refundCount: 0,
      refundedRevenue: 0,
      netRevenue: 0,
    };
  }

  apply(
    state: RevenueProjectionState,
    event: CommerceEvent,
    _context: ProjectionContext,
  ): RevenueProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.ORDER_PAID: {
        const currency = state.currency;

        if (currency !== null && currency !== event.payload.currency) {
          throw new Error(
            `Revenue projection received multiple currencies: "${currency}" and "${event.payload.currency}".`,
          );
        }

        const nextGrossRevenue = state.grossRevenue + event.payload.amount;

        const nextNetRevenue = nextGrossRevenue - state.refundedRevenue;

        return {
          ...state,
          currency: event.payload.currency,
          paidOrderCount: state.paidOrderCount + 1,
          grossRevenue: nextGrossRevenue,
          netRevenue: nextNetRevenue,
        };
      }

      case COMMERCE_EVENT_TYPES.REFUND_ISSUED: {
        const currency = state.currency;

        if (currency !== null && currency !== event.payload.currency) {
          throw new Error(
            `Revenue projection received multiple currencies: "${currency}" and "${event.payload.currency}".`,
          );
        }

        const nextRefundedRevenue = state.refundedRevenue + event.payload.amount;

        const nextNetRevenue = state.grossRevenue - nextRefundedRevenue;

        return {
          ...state,
          currency: event.payload.currency,
          refundCount: state.refundCount + 1,
          refundedRevenue: nextRefundedRevenue,
          netRevenue: nextNetRevenue,
        };
      }

      default:
        return state;
    }
  }

  serialize(state: RevenueProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): RevenueProjectionState {
    return snapshot as RevenueProjectionState;
  }
}
