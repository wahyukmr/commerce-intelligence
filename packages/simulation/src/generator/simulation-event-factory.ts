import type {
  CartItemAddedPayload,
  CheckoutStartedPayload,
  CustomerRegisteredPayload,
  OrderCancelledPayload,
  OrderPaidPayload,
  OrderPlacedPayload,
  ProductViewedPayload,
  RefundIssuedPayload,
  SessionStartedPayload,
} from "@ci/commerce";

import type { EventEnvelope } from "@ci/runtime";

export class SimulationEventFactory {
  public constructor(private readonly tenantId: string) {}

  public customerRegistered(
    id: string,
    customerId: string,
    occurredAt: number,
    payload: Omit<CustomerRegisteredPayload, "customerId" | "registeredAt">,
  ): EventEnvelope<"customer.registered", CustomerRegisteredPayload> {
    return {
      id,
      type: "customer.registered",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        customerId,
        registeredAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public sessionStarted(
    id: string,
    occurredAt: number,
    payload: Omit<SessionStartedPayload, "startedAt">,
  ): EventEnvelope<"session.started", SessionStartedPayload> {
    return {
      id,
      type: "session.started",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        startedAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public productViewed(
    id: string,
    occurredAt: number,
    payload: Omit<ProductViewedPayload, "viewedAt">,
  ): EventEnvelope<"product.viewed", ProductViewedPayload> {
    return {
      id,
      type: "product.viewed",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        viewedAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public cartItemAdded(
    id: string,
    occurredAt: number,
    payload: Omit<CartItemAddedPayload, "addedAt">,
  ): EventEnvelope<"cart.item_added", CartItemAddedPayload> {
    return {
      id,
      type: "cart.item_added",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        addedAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public checkoutStarted(
    id: string,
    occurredAt: number,
    payload: Omit<CheckoutStartedPayload, "startedAt">,
  ): EventEnvelope<"checkout.started", CheckoutStartedPayload> {
    return {
      id,
      type: "checkout.started",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        startedAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public orderPlaced(
    id: string,
    occurredAt: number,
    payload: Omit<OrderPlacedPayload, "placedAt">,
  ): EventEnvelope<"order.placed", OrderPlacedPayload> {
    return {
      id,
      type: "order.placed",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        placedAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public orderPaid(
    id: string,
    occurredAt: number,
    payload: Omit<OrderPaidPayload, "paidAt">,
  ): EventEnvelope<"order.paid", OrderPaidPayload> {
    return {
      id,
      type: "order.paid",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        paidAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public orderCancelled(
    id: string,
    occurredAt: number,
    payload: Omit<OrderCancelledPayload, "cancelledAt">,
  ): EventEnvelope<"order.cancelled", OrderCancelledPayload> {
    return {
      id,
      type: "order.cancelled",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        cancelledAt: new Date(occurredAt).toISOString(),
      },
    };
  }

  public refundIssued(
    id: string,
    occurredAt: number,
    payload: Omit<RefundIssuedPayload, "issuedAt">,
  ): EventEnvelope<"refund.issued", RefundIssuedPayload> {
    return {
      id,
      type: "refund.issued",
      version: 1,
      occurredAt: new Date(occurredAt).toISOString(),
      tenantId: this.tenantId,
      payload: {
        ...payload,
        issuedAt: new Date(occurredAt).toISOString(),
      },
    };
  }
}
