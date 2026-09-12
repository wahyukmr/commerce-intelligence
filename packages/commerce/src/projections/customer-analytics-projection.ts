import type { Projection, ProjectionContext } from "@ci/runtime";
import type {
  CustomerAnalytics,
  CustomerAnalyticsProjectionState,
} from "../domain/customer-analytics";
import type { CommerceEvent } from "../events/commerce-event";
import { COMMERCE_EVENT_TYPES } from "../events/event-types";

export class CustomerAnalyticsProjection implements Projection<CustomerAnalyticsProjectionState> {
  readonly name = "commerce.customer.analytics";

  createInitialState(_context: ProjectionContext): CustomerAnalyticsProjectionState {
    return {
      currency: null,
      customers: {},
      customersWithPurchase: 0,
    };
  }

  apply(
    state: CustomerAnalyticsProjectionState,
    event: CommerceEvent,
    _context: ProjectionContext,
  ): CustomerAnalyticsProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.ORDER_PAID:
        return this.applyOrderPaid(state, event);

      case COMMERCE_EVENT_TYPES.REFUND_ISSUED:
        return this.applyRefundIssued(state, event);

      default:
        return state;
    }
  }

  serialize(state: CustomerAnalyticsProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): CustomerAnalyticsProjectionState {
    return snapshot as CustomerAnalyticsProjectionState;
  }

  private applyOrderPaid(
    state: CustomerAnalyticsProjectionState,
    event: Extract<
      CommerceEvent,
      {
        type: "order.paid";
      }
    >,
  ): CustomerAnalyticsProjectionState {
    this.assertCurrency(state.currency, event.payload.currency);

    const existing = state.customers[event.payload.customerId];

    const isFirstPurchase = !existing || existing.paidOrderCount === 0;

    const nextPaidOrderCount = (existing?.paidOrderCount ?? 0) + 1;

    const nextLifetimeRevenue = (existing?.lifetimeRevenue ?? 0) + event.payload.amount;

    const nextRefundedRevenue = existing?.refundedRevenue ?? 0;

    const nextNetRevenue = nextLifetimeRevenue - nextRefundedRevenue;

    const nextAverageOrderValue =
      nextPaidOrderCount === 0 ? 0 : nextLifetimeRevenue / nextPaidOrderCount;

    const customer: CustomerAnalytics = {
      customerId: event.payload.customerId,
      firstPurchaseAt: existing?.firstPurchaseAt ?? event.payload.paidAt,
      lastPurchaseAt: event.payload.paidAt,
      paidOrderCount: nextPaidOrderCount,
      lifetimeRevenue: nextLifetimeRevenue,
      refundedRevenue: nextRefundedRevenue,
      netRevenue: nextNetRevenue,
      repeatPurchaseCount: Math.max(nextPaidOrderCount - 1, 0),
      averageOrderValue: nextAverageOrderValue,
    };

    return {
      ...state,
      currency: state.currency ?? event.payload.currency,
      customers: {
        ...state.customers,
        [customer.customerId]: customer,
      },
      customersWithPurchase: state.customersWithPurchase + (isFirstPurchase ? 1 : 0),
    };
  }

  private applyRefundIssued(
    state: CustomerAnalyticsProjectionState,
    event: Extract<
      CommerceEvent,
      {
        type: "refund.issued";
      }
    >,
  ): CustomerAnalyticsProjectionState {
    this.assertCurrency(state.currency, event.payload.currency);

    const existing = state.customers[event.payload.customerId];

    if (!existing) {
      return state;
    }

    const nextRefundedRevenue = existing.refundedRevenue + event.payload.amount;

    const nextNetRevenue = existing.lifetimeRevenue - nextRefundedRevenue;

    const customer: CustomerAnalytics = {
      ...existing,
      refundedRevenue: nextRefundedRevenue,
      netRevenue: nextNetRevenue,
    };

    return {
      ...state,
      currency: state.currency ?? event.payload.currency,
      customers: {
        ...state.customers,
        [customer.customerId]: customer,
      },
    };
  }

  private assertCurrency(currentCurrency: string | null, nextCurrency: string): void {
    if (currentCurrency !== null && currentCurrency !== nextCurrency) {
      throw new Error(
        `Customer analytics projection received multiple currencies: "${currentCurrency}" and "${nextCurrency}".`,
      );
    }
  }
}
