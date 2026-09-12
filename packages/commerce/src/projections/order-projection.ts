import type { Projection, ProjectionContext } from "@ci/runtime";
import type { Order, OrderItem, OrderProjectionState } from "../domain/order";
import type { CommerceEvent } from "../events/commerce-event";
import { COMMERCE_EVENT_TYPES } from "../events/event-types";

export class OrderProjection implements Projection<OrderProjectionState> {
  readonly name = "commerce.order";

  createInitialState(_context: ProjectionContext): OrderProjectionState {
    return {
      orders: {},
      totalOrders: 0,
      paidOrders: 0,
      cancelledOrders: 0,
      refundedOrders: 0,
      grossRevenue: 0,
      refundedRevenue: 0,
    };
  }

  apply(
    state: OrderProjectionState,
    event: CommerceEvent,
    _context: ProjectionContext,
  ): OrderProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.ORDER_PLACED: {
        if (state.orders[event.payload.orderId]) {
          return state;
        }

        const items: readonly OrderItem[] = event.payload.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));

        const order: Order = {
          id: event.payload.orderId,
          customerId: event.payload.customerId,
          placedAt: event.payload.placedAt,
          currency: event.payload.currency,
          items,
          subtotal: event.payload.subtotal,
          discount: event.payload.discount,
          tax: event.payload.tax,
          shipping: event.payload.shipping,
          total: event.payload.total,
          status: "placed",
          paidAt: null,
          cancelledAt: null,
        };

        return {
          ...state,
          orders: {
            ...state.orders,
            [order.id]: order,
          },
          totalOrders: state.totalOrders + 1,
        };
      }

      case COMMERCE_EVENT_TYPES.ORDER_PAID: {
        const existing = state.orders[event.payload.orderId];

        if (!existing) {
          return state;
        }

        if (existing.status === "paid") {
          return state;
        }

        const updatedOrder: Order = {
          ...existing,
          status: "paid",
          paidAt: event.payload.paidAt,
        };

        return {
          ...state,
          orders: {
            ...state.orders,
            [updatedOrder.id]: updatedOrder,
          },
          paidOrders: state.paidOrders + 1,
          grossRevenue: state.grossRevenue + event.payload.amount,
        };
      }

      case COMMERCE_EVENT_TYPES.ORDER_CANCELLED: {
        const existing = state.orders[event.payload.orderId];

        if (!existing) {
          return state;
        }

        if (existing.status === "cancelled" || existing.status === "refunded") {
          return state;
        }

        const updatedOrder: Order = {
          ...existing,
          status: "cancelled",
          cancelledAt: event.payload.cancelledAt,
        };

        return {
          ...state,
          orders: {
            ...state.orders,
            [updatedOrder.id]: updatedOrder,
          },
          cancelledOrders: state.cancelledOrders + 1,
        };
      }

      case COMMERCE_EVENT_TYPES.REFUND_ISSUED: {
        const existing = state.orders[event.payload.orderId];

        if (!existing) {
          return state;
        }

        if (existing.status === "refunded") {
          return state;
        }

        const updatedOrder: Order = {
          ...existing,
          status: "refunded",
        };

        return {
          ...state,
          orders: {
            ...state.orders,
            [updatedOrder.id]: updatedOrder,
          },
          refundedOrders: state.refundedOrders + 1,
          refundedRevenue: state.refundedRevenue + event.payload.amount,
        };
      }

      default:
        return state;
    }
  }

  serialize(state: OrderProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): OrderProjectionState {
    return snapshot as OrderProjectionState;
  }
}
