import type { BehavioralEvent } from "../events/behavioral-event.js";
import type { CommerceEvent, OrderItemPayload } from "../events/commerce-event.js";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export interface CommerceEventValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export class CommerceEventValidationError extends Error {
  readonly errors: readonly string[];

  constructor(errors: readonly string[]) {
    super(`Commerce event validation failed: ${errors.join(" ")}`);

    this.name = "CommerceEventValidationError";

    this.errors = errors;
  }
}
function validateSessionStarted(
  event: Extract<
    BehavioralEvent,
    {
      type: "session.started";
    }
  >,
  errors: string[],
): void {
  const { sessionId, visitorId, customerId, startedAt } = event.payload;

  if (sessionId.trim().length === 0) {
    errors.push("sessionId must not be empty.");
  }

  if (visitorId.trim().length === 0) {
    errors.push("visitorId must not be empty.");
  }

  if (customerId !== null && customerId.trim().length === 0) {
    errors.push("customerId must be null or a non-empty string.");
  }

  if (!isValidIsoDate(startedAt)) {
    errors.push("startedAt must be a valid ISO-8601 UTC timestamp.");
  }
}

function validateProductViewed(
  event: Extract<
    BehavioralEvent,
    {
      type: "product.viewed";
    }
  >,
  errors: string[],
): void {
  const { sessionId, visitorId, customerId, productId, viewedAt } = event.payload;

  validateBehaviorIdentity(sessionId, visitorId, customerId, errors);

  if (productId.trim().length === 0) {
    errors.push("productId must not be empty.");
  }

  if (!isValidIsoDate(viewedAt)) {
    errors.push("viewedAt must be a valid ISO-8601 UTC timestamp.");
  }
}

function validateCartItemAdded(
  event: Extract<
    BehavioralEvent,
    {
      type: "cart.item_added";
    }
  >,
  errors: string[],
): void {
  const { sessionId, visitorId, customerId, productId, quantity, addedAt } = event.payload;

  validateBehaviorIdentity(sessionId, visitorId, customerId, errors);

  if (productId.trim().length === 0) {
    errors.push("productId must not be empty.");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push("Cart quantity must be a positive integer.");
  }

  if (!isValidIsoDate(addedAt)) {
    errors.push("addedAt must be a valid ISO-8601 UTC timestamp.");
  }
}

function validateCheckoutStarted(
  event: Extract<
    BehavioralEvent,
    {
      type: "checkout.started";
    }
  >,
  errors: string[],
): void {
  const { sessionId, visitorId, customerId, startedAt, itemCount, merchandiseValue, currency } =
    event.payload;

  validateBehaviorIdentity(sessionId, visitorId, customerId, errors);

  if (!isValidIsoDate(startedAt)) {
    errors.push("startedAt must be a valid ISO-8601 UTC timestamp.");
  }

  if (!Number.isInteger(itemCount) || itemCount <= 0) {
    errors.push("Checkout itemCount must be a positive integer.");
  }

  validateNonNegativeMoney(merchandiseValue, "merchandiseValue", errors);

  validateCurrency(currency, errors);
}

function validateBehaviorIdentity(
  sessionId: string,
  visitorId: string,
  customerId: string | null,
  errors: string[],
): void {
  if (sessionId.trim().length === 0) {
    errors.push("sessionId must not be empty.");
  }

  if (visitorId.trim().length === 0) {
    errors.push("visitorId must not be empty.");
  }

  if (customerId !== null && customerId.trim().length === 0) {
    errors.push("customerId must be null or a non-empty string.");
  }
}

type ValidatableCommerceEvent = CommerceEvent | BehavioralEvent;

export function validateCommerceEvent(
  event: ValidatableCommerceEvent,
): CommerceEventValidationResult {
  const errors: string[] = [];

  validateCommonFields(event, errors);

  switch (event.type) {
    case "customer.registered":
      validateCustomerRegistered(event, errors);
      break;

    case "session.started":
      validateSessionStarted(event, errors);
      break;

    case "product.viewed":
      validateProductViewed(event, errors);
      break;

    case "cart.item_added":
      validateCartItemAdded(event, errors);
      break;

    case "checkout.started":
      validateCheckoutStarted(event, errors);
      break;

    case "order.placed":
      validateOrderPlaced(event, errors);
      break;

    case "order.paid":
      validateOrderPaid(event, errors);
      break;

    case "order.cancelled":
      validateOrderCancelled(event, errors);
      break;

    case "refund.issued":
      validateRefundIssued(event, errors);
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertValidCommerceEvent(event: CommerceEvent | BehavioralEvent): void {
  const result = validateCommerceEvent(event);

  if (!result.valid) {
    throw new CommerceEventValidationError(result.errors);
  }
}

function validateCommonFields(event: ValidatableCommerceEvent, errors: string[]): void {
  if (event.id.trim().length === 0) {
    errors.push("Event id must not be empty.");
  }

  if (!Number.isInteger(event.version) || event.version < 1) {
    errors.push("Event version must be a positive integer.");
  }

  if (event.tenantId.trim().length === 0) {
    errors.push("Event tenantId must not be empty.");
  }

  if (!isValidIsoDate(event.occurredAt)) {
    errors.push("Event occurredAt must be a valid ISO-8601 UTC timestamp.");
  }
}

function validateCustomerRegistered(
  event: Extract<
    CommerceEvent,
    {
      type: "customer.registered";
    }
  >,
  errors: string[],
): void {
  const { customerId, email, registeredAt, country, source } = event.payload;

  if (customerId.trim().length === 0) {
    errors.push("customerId must not be empty.");
  }

  if (!isValidEmail(email)) {
    errors.push("Customer email must be valid.");
  }

  if (!isValidIsoDate(registeredAt)) {
    errors.push("registeredAt must be a valid ISO-8601 UTC timestamp.");
  }

  if (country.trim().length === 0) {
    errors.push("country must not be empty.");
  }

  if (source.trim().length === 0) {
    errors.push("source must not be empty.");
  }
}

function validateOrderPlaced(
  event: Extract<
    CommerceEvent,
    {
      type: "order.placed";
    }
  >,
  errors: string[],
): void {
  const {
    orderId,
    customerId,
    placedAt,
    currency,
    items,
    subtotal,
    discount,
    tax,
    shipping,
    total,
  } = event.payload;

  if (orderId.trim().length === 0) {
    errors.push("orderId must not be empty.");
  }

  if (customerId.trim().length === 0) {
    errors.push("customerId must not be empty.");
  }

  if (!isValidIsoDate(placedAt)) {
    errors.push("placedAt must be a valid ISO-8601 UTC timestamp.");
  }

  validateCurrency(currency, errors);

  if (items.length === 0) {
    errors.push("Order must contain at least one item.");
  }

  validateOrderItems(items, errors);

  validateNonNegativeMoney(subtotal, "subtotal", errors);

  validateNonNegativeMoney(discount, "discount", errors);

  validateNonNegativeMoney(tax, "tax", errors);

  validateNonNegativeMoney(shipping, "shipping", errors);

  validateNonNegativeMoney(total, "total", errors);

  const itemTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const expectedTotal = subtotal - discount + tax + shipping;

  if (!approximatelyEqual(itemTotal, subtotal)) {
    errors.push("subtotal must equal the sum of order item values.");
  }

  if (!approximatelyEqual(total, expectedTotal)) {
    errors.push("total must equal subtotal - discount + tax + shipping.");
  }
}

function validateOrderPaid(
  event: Extract<
    CommerceEvent,
    {
      type: "order.paid";
    }
  >,
  errors: string[],
): void {
  const { orderId, customerId, paidAt, currency, amount } = event.payload;

  if (orderId.trim().length === 0) {
    errors.push("orderId must not be empty.");
  }

  if (customerId.trim().length === 0) {
    errors.push("customerId must not be empty.");
  }

  if (!isValidIsoDate(paidAt)) {
    errors.push("paidAt must be a valid ISO-8601 UTC timestamp.");
  }

  validateCurrency(currency, errors);

  validatePositiveMoney(amount, "amount", errors);
}

function validateOrderCancelled(
  event: Extract<
    CommerceEvent,
    {
      type: "order.cancelled";
    }
  >,
  errors: string[],
): void {
  const { orderId, customerId, cancelledAt, reason } = event.payload;

  if (orderId.trim().length === 0) {
    errors.push("orderId must not be empty.");
  }

  if (customerId.trim().length === 0) {
    errors.push("customerId must not be empty.");
  }

  if (!isValidIsoDate(cancelledAt)) {
    errors.push("cancelledAt must be a valid ISO-8601 UTC timestamp.");
  }

  if (reason.trim().length === 0) {
    errors.push("Cancellation reason must not be empty.");
  }
}

function validateRefundIssued(
  event: Extract<
    CommerceEvent,
    {
      type: "refund.issued";
    }
  >,
  errors: string[],
): void {
  const { refundId, orderId, customerId, issuedAt, currency, amount, reason } = event.payload;

  if (refundId.trim().length === 0) {
    errors.push("refundId must not be empty.");
  }

  if (orderId.trim().length === 0) {
    errors.push("orderId must not be empty.");
  }

  if (customerId.trim().length === 0) {
    errors.push("customerId must not be empty.");
  }

  if (!isValidIsoDate(issuedAt)) {
    errors.push("issuedAt must be a valid ISO-8601 UTC timestamp.");
  }

  validateCurrency(currency, errors);

  validatePositiveMoney(amount, "amount", errors);

  if (reason.trim().length === 0) {
    errors.push("Refund reason must not be empty.");
  }
}

function validateOrderItems(items: readonly OrderItemPayload[], errors: string[]): void {
  const productIds = new Set<string>();

  for (const item of items) {
    if (item.productId.trim().length === 0) {
      errors.push("Order item productId must not be empty.");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      errors.push("Order item quantity must be a positive integer.");
    }

    validateNonNegativeMoney(item.unitPrice, "Order item unitPrice", errors);

    if (productIds.has(item.productId)) {
      errors.push(`Product "${item.productId}" occurs more than once in the same order.`);
    }

    productIds.add(item.productId);
  }
}

function validateCurrency(currency: string, errors: string[]): void {
  if (!/^[A-Z]{3}$/.test(currency)) {
    errors.push("Currency must be a three-letter uppercase ISO currency code.");
  }
}

function validatePositiveMoney(value: number, field: string, errors: string[]): void {
  if (!Number.isFinite(value) || value <= 0) {
    errors.push(`${field} must be a positive finite number.`);
  }
}

function validateNonNegativeMoney(value: number, field: string, errors: string[]): void {
  if (!Number.isFinite(value) || value < 0) {
    errors.push(`${field} must be a non-negative finite number.`);
  }
}

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value)) && value.endsWith("Z");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function approximatelyEqual(left: number, right: number, epsilon = 0.000001): boolean {
  return Math.abs(left - right) <= epsilon;
}
