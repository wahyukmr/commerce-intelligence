import type { Projection, ProjectionContext } from "@ci/runtime";
import type { Customer, CustomerProjectionState } from "../domain/customer";
import type { CommerceEvent } from "../events/commerce-event";
import { COMMERCE_EVENT_TYPES } from "../events/event-types";

export class CustomerProjection implements Projection<CustomerProjectionState> {
  readonly name = "commerce.customer";

  createInitialState(_context: ProjectionContext): CustomerProjectionState {
    return {
      customers: {},
      totalCustomers: 0,
      totalOrders: 0,
      paidOrders: 0,
      lifetimeRevenue: 0,
    };
  }

  apply(
    state: CustomerProjectionState,
    event: CommerceEvent,
    _context: ProjectionContext,
  ): CustomerProjectionState {
    switch (event.type) {
      case COMMERCE_EVENT_TYPES.CUSTOMER_REGISTERED: {
        if (state.customers[event.payload.customerId]) {
          return state;
        }

        const customer: Customer = {
          id: event.payload.customerId,
          email: event.payload.email,
          registeredAt: event.payload.registeredAt,
          country: event.payload.country,
          source: event.payload.source,
        };

        return {
          ...state,
          customers: {
            ...state.customers,
            [customer.id]: customer,
          },
          totalCustomers: state.totalCustomers + 1,
        };
      }

      case COMMERCE_EVENT_TYPES.ORDER_PLACED: {
        return {
          ...state,
          totalOrders: state.totalOrders + 1,
        };
      }

      case COMMERCE_EVENT_TYPES.ORDER_PAID: {
        return {
          ...state,
          paidOrders: state.paidOrders + 1,
          lifetimeRevenue: state.lifetimeRevenue + event.payload.amount,
        };
      }

      default:
        return state;
    }
  }

  serialize(state: CustomerProjectionState): unknown {
    return state;
  }

  deserialize(snapshot: unknown): CustomerProjectionState {
    return snapshot as CustomerProjectionState;
  }
}
