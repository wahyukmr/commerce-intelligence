import type { EventEnvelope } from "@ci/runtime";

export interface CustomerRegisteredPayload {
  readonly customerId: string;
  readonly email: string;
  readonly registeredAt: string;
  readonly country: string;
  readonly source: string;
}

export interface OrderItemPayload {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
}

export interface OrderPlacedPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly placedAt: string;
  readonly currency: string;
  readonly items: readonly OrderItemPayload[];
  readonly subtotal: number;
  readonly discount: number;
  readonly tax: number;
  readonly shipping: number;
  readonly total: number;
}

export interface OrderPaidPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly paidAt: string;
  readonly currency: string;
  readonly amount: number;
}

export interface OrderCancelledPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly cancelledAt: string;
  readonly reason: string;
}

export interface RefundIssuedPayload {
  readonly refundId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly issuedAt: string;
  readonly currency: string;
  readonly amount: number;
  readonly reason: string;
}

export type CommerceEvent =
  | EventEnvelope<"customer.registered", CustomerRegisteredPayload>
  | EventEnvelope<"order.placed", OrderPlacedPayload>
  | EventEnvelope<"order.paid", OrderPaidPayload>
  | EventEnvelope<"order.cancelled", OrderCancelledPayload>
  | EventEnvelope<"refund.issued", RefundIssuedPayload>;

export type CommerceEventPayload = CommerceEvent["payload"];

export type CommerceEventEnvelope<
  TType extends CommerceEvent["type"] = CommerceEvent["type"],
  TPayload = CommerceEventPayload,
> = EventEnvelope<TType, TPayload>;
