import type { Query, QueryContext, RuntimeSnapshot } from "@ci/runtime";

import type { ProductAnalytics, ProductAnalyticsProjectionState } from "../domain/product.js";

export interface ProductAnalyticsQueryInput {
  readonly productId: string;
}

export interface ProductAnalyticsQueryResult {
  readonly product: ProductAnalytics | null;
}

export interface ProductAnalyticsSummary {
  readonly currency: string | null;
  readonly productCount: number;
  readonly totalOrderCount: number;
  readonly totalUnitsOrdered: number;
  readonly totalMerchandiseValue: number;
  readonly averageUnitPrice: number;
}

export interface TopProductsQueryInput {
  readonly limit?: number;
}

function getProductAnalyticsState(snapshot: RuntimeSnapshot): ProductAnalyticsProjectionState {
  const projection = snapshot.projections.find(
    (item) => item.name === "commerce.product.analytics",
  );

  if (!projection) {
    throw new Error('Required projection "commerce.product.analytics" is not available.');
  }

  return projection.state as ProductAnalyticsProjectionState;
}

export class ProductAnalyticsQuery
  implements Query<ProductAnalyticsQueryInput, ProductAnalyticsQueryResult>
{
  readonly name = "commerce.product.analytics";

  execute(
    snapshot: RuntimeSnapshot,
    input: ProductAnalyticsQueryInput,
    _context: QueryContext,
  ): ProductAnalyticsQueryResult {
    const state = getProductAnalyticsState(snapshot);

    return {
      product: state.products[input.productId] ?? null,
    };
  }
}

export class ProductAnalyticsSummaryQuery implements Query<undefined, ProductAnalyticsSummary> {
  readonly name = "commerce.product.analytics.summary";

  execute(
    snapshot: RuntimeSnapshot,
    _input: undefined,
    _context: QueryContext,
  ): ProductAnalyticsSummary {
    const state = getProductAnalyticsState(snapshot);

    const products = Object.values(state.products);

    const totalOrderCount = products.reduce((total, product) => total + product.orderCount, 0);

    const totalUnitsOrdered = products.reduce((total, product) => total + product.unitsOrdered, 0);

    const totalMerchandiseValue = products.reduce(
      (total, product) => total + product.merchandiseValue,
      0,
    );

    return {
      currency: state.currency,
      productCount: products.length,
      totalOrderCount,
      totalUnitsOrdered,
      totalMerchandiseValue,
      averageUnitPrice: totalUnitsOrdered === 0 ? 0 : totalMerchandiseValue / totalUnitsOrdered,
    };
  }
}

export class TopProductsQuery
  implements Query<TopProductsQueryInput | undefined, readonly ProductAnalytics[]>
{
  readonly name = "commerce.product.analytics.top";

  execute(
    snapshot: RuntimeSnapshot,
    input: TopProductsQueryInput | undefined,
    _context: QueryContext,
  ): readonly ProductAnalytics[] {
    const state = getProductAnalyticsState(snapshot);

    const limit = Math.max(1, Math.floor(input?.limit ?? 10));

    return Object.values(state.products)
      .sort((left, right) => {
        const valueDifference = right.merchandiseValue - left.merchandiseValue;

        if (valueDifference !== 0) {
          return valueDifference;
        }

        return left.productId.localeCompare(right.productId);
      })
      .slice(0, limit);
  }
}
