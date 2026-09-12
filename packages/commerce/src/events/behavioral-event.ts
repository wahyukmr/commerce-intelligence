import type { EventEnvelope } from "@ci/runtime";

import type { CommerceEventType } from "./event-types";

export interface SessionStartedPayload {
  readonly sessionId: string;
  readonly visitorId: string;
  readonly customerId: string | null;
  readonly startedAt: string;
  readonly landingPage: string | null;
  readonly source: string | null;
  readonly medium: string | null;
  readonly campaign: string | null;
}

export interface ProductViewedPayload {
  readonly sessionId: string;
  readonly visitorId: string;
  readonly customerId: string | null;
  readonly productId: string;
  readonly viewedAt: string;
}

export interface CartItemAddedPayload {
  readonly sessionId: string;
  readonly visitorId: string;
  readonly customerId: string | null;
  readonly productId: string;
  readonly quantity: number;
  readonly addedAt: string;
}

export interface CheckoutStartedPayload {
  readonly sessionId: string;
  readonly visitorId: string;
  readonly customerId: string | null;
  readonly startedAt: string;
  readonly itemCount: number;
  readonly merchandiseValue: number;
  readonly currency: string;
}

export type BehavioralEvent =
  | EventEnvelope<"session.started", SessionStartedPayload>
  | EventEnvelope<"product.viewed", ProductViewedPayload>
  | EventEnvelope<"cart.item_added", CartItemAddedPayload>
  | EventEnvelope<"checkout.started", CheckoutStartedPayload>;

export type BehavioralEventEnvelope<
  TType extends Extract<
    CommerceEventType,
    "session.started" | "product.viewed" | "cart.item_added" | "checkout.started"
  > = Extract<
    CommerceEventType,
    "session.started" | "product.viewed" | "cart.item_added" | "checkout.started"
  >,
  TPayload = BehavioralEvent["payload"],
> = EventEnvelope<TType, TPayload>;
