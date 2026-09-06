export const COMMERCE_EVENT_TYPES = {
  CUSTOMER_REGISTERED: "customer.registered",
  SESSION_STARTED: "session.started",
  PRODUCT_VIEWED: "product.viewed",
  CART_ITEM_ADDED: "cart.item_added",
  CHECKOUT_STARTED: "checkout.started",
  ORDER_PLACED: "order.placed",
  ORDER_PAID: "order.paid",
  ORDER_CANCELLED: "order.cancelled",
  REFUND_ISSUED: "refund.issued",
} as const;

export type CommerceEventType = (typeof COMMERCE_EVENT_TYPES)[keyof typeof COMMERCE_EVENT_TYPES];
