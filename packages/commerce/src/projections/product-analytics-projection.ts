import type { Projection, ProjectionContext } from "@ci/runtime";
import type { ProductAnalytics, ProductAnalyticsProjectionState } from "../domain/product.js";
import type { CommerceEvent } from "../events/commerce-event.js";
import { COMMERCE_EVENT_TYPES } from "../events/event-types.js";

export class ProductAnalyticsProjection implements Projection<ProductAnalyticsProjectionState> {
  readonly name = "commerce.product-analytics";

  createInitialState(_context: ProjectionContext): ProductAnalyticsProjectionState {
    return {
      currency: null,
      products: {},
    };
  }

  apply(
    state: ProductAnalyticsProjectionState,
    event: CommerceEvent,
    _context: ProjectionContext,
  ): ProductAnalyticsProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.ORDER_PLACED:
        return this.applyOrderPlaced(state, event);

      default:
        return state;
    }
  }

  serialize(state: ProductAnalyticsProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): ProductAnalyticsProjectionState {
    return snapshot as ProductAnalyticsProjectionState;
  }

  private applyOrderPlaced(
    state: ProductAnalyticsProjectionState,
    event: Extract<
      CommerceEvent,
      {
        type: "order.placed";
      }
    >,
  ): ProductAnalyticsProjectionState {
    this.assertCurrency(state.currency, event.payload.currency);

    const products = {
      ...state.products,
    };

    for (const item of event.payload.items) {
      const existing = products[item.productId];

      const merchandiseValue = item.quantity * item.unitPrice;

      const nextUnitsOrdered = (existing?.unitsOrdered ?? 0) + item.quantity;

      const nextMerchandiseValue = (existing?.merchandiseValue ?? 0) + merchandiseValue;

      const nextOrderCount = (existing?.orderCount ?? 0) + 1;

      const averageUnitPrice = nextUnitsOrdered === 0 ? 0 : nextMerchandiseValue / nextUnitsOrdered;

      const product: ProductAnalytics = {
        productId: item.productId,
        orderCount: nextOrderCount,
        unitsOrdered: nextUnitsOrdered,
        merchandiseValue: nextMerchandiseValue,
        averageUnitPrice,
      };

      products[item.productId] = product;
    }

    return {
      ...state,
      currency: state.currency ?? event.payload.currency,
      products,
    };
  }

  private assertCurrency(currentCurrency: string | null, nextCurrency: string): void {
    if (currentCurrency !== null && currentCurrency !== nextCurrency) {
      throw new Error(
        `Product analytics projection received multiple currencies: "${currentCurrency}" and "${nextCurrency}".`,
      );
    }
  }
}
