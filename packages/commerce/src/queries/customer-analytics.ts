import type { Query, QueryContext, RuntimeSnapshot } from "@ci/runtime";

import type {
  CustomerAnalytics,
  CustomerAnalyticsProjectionState,
} from "../domain/customer-analytics.js";

export interface CustomerAnalyticsQueryInput {
  readonly customerId: string;
}

export interface CustomerAnalyticsQueryResult {
  readonly customer: CustomerAnalytics | null;
}

export interface CustomerAnalyticsSummary {
  readonly currency: string | null;
  readonly customersWithPurchase: number;
  readonly totalPaidOrders: number;
  readonly totalLifetimeRevenue: number;
  readonly totalRefundedRevenue: number;
  readonly totalNetRevenue: number;
  readonly averageOrderValue: number;
}

export interface TopCustomersQueryInput {
  readonly limit?: number;
}

export interface TopCustomer {
  readonly customerId: string;
  readonly lifetimeRevenue: number;
  readonly netRevenue: number;
  readonly paidOrderCount: number;
  readonly repeatPurchaseCount: number;
  readonly averageOrderValue: number;
}

function getCustomerAnalyticsState(snapshot: RuntimeSnapshot): CustomerAnalyticsProjectionState {
  const projection = snapshot.projections.find(
    (item) => item.name === "commerce.customer-analytics",
  );

  if (!projection) {
    throw new Error('Required projection "commerce.customer-analytics" is not available.');
  }

  return projection.state as CustomerAnalyticsProjectionState;
}

export class CustomerAnalyticsQuery
  implements Query<CustomerAnalyticsQueryInput, CustomerAnalyticsQueryResult>
{
  readonly name = "commerce.customer.analytics";

  execute(
    snapshot: RuntimeSnapshot,
    input: CustomerAnalyticsQueryInput,
    _context: QueryContext,
  ): CustomerAnalyticsQueryResult {
    const state = getCustomerAnalyticsState(snapshot);

    return {
      customer: state.customers[input.customerId] ?? null,
    };
  }
}

export class CustomerAnalyticsSummaryQuery implements Query<undefined, CustomerAnalyticsSummary> {
  readonly name = "commerce.customer.analytics.summary";

  execute(
    snapshot: RuntimeSnapshot,
    _input: undefined,
    _context: QueryContext,
  ): CustomerAnalyticsSummary {
    const state = getCustomerAnalyticsState(snapshot);

    const customers = Object.values(state.customers);

    const totalPaidOrders = customers.reduce(
      (total, customer) => total + customer.paidOrderCount,
      0,
    );

    const totalLifetimeRevenue = customers.reduce(
      (total, customer) => total + customer.lifetimeRevenue,
      0,
    );

    const totalRefundedRevenue = customers.reduce(
      (total, customer) => total + customer.refundedRevenue,
      0,
    );

    const totalNetRevenue = customers.reduce((total, customer) => total + customer.netRevenue, 0);

    return {
      currency: state.currency,
      customersWithPurchase: state.customersWithPurchase,
      totalPaidOrders,
      totalLifetimeRevenue,
      totalRefundedRevenue,
      totalNetRevenue,
      averageOrderValue: totalPaidOrders === 0 ? 0 : totalLifetimeRevenue / totalPaidOrders,
    };
  }
}

export class TopCustomersQuery
  implements Query<TopCustomersQueryInput | undefined, readonly TopCustomer[]>
{
  readonly name = "commerce.customer.analytics.top";

  execute(
    snapshot: RuntimeSnapshot,
    input: TopCustomersQueryInput | undefined,
    _context: QueryContext,
  ): readonly TopCustomer[] {
    const state = getCustomerAnalyticsState(snapshot);

    const limit = Math.max(1, Math.floor(input?.limit ?? 10));

    return Object.values(state.customers)
      .sort((left, right) => {
        const revenueDifference = right.netRevenue - left.netRevenue;

        if (revenueDifference !== 0) {
          return revenueDifference;
        }

        return left.customerId.localeCompare(right.customerId);
      })
      .slice(0, limit)
      .map(
        (customer): TopCustomer => ({
          customerId: customer.customerId,
          lifetimeRevenue: customer.lifetimeRevenue,
          netRevenue: customer.netRevenue,
          paidOrderCount: customer.paidOrderCount,
          repeatPurchaseCount: customer.repeatPurchaseCount,
          averageOrderValue: customer.averageOrderValue,
        }),
      );
  }
}
