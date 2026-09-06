export type {
  Customer,
  CustomerProjectionState,
} from "./domain/customer.js";
export type {
  CustomerAnalytics,
  CustomerAnalyticsProjectionState,
} from "./domain/customer-analytics.js";
export type {
  FunnelConversion,
  FunnelCounts,
  FunnelProjectionState,
  FunnelSession,
  FunnelStage,
} from "./domain/funnel.js";
export type {
  Order,
  OrderItem,
  OrderProjectionState,
  OrderStatus,
} from "./domain/order.js";
export type {
  Product,
  ProductAnalytics,
  ProductAnalyticsProjectionState,
} from "./domain/product.js";
export type {
  CustomerRetentionRecord,
  RetentionCohort,
  RetentionProjectionState,
} from "./domain/retention.js";
export type { RevenueProjectionState } from "./domain/revenue.js";
export type {
  SessionAnalytics,
  SessionBehaviorProjectionState,
} from "./domain/session.js";
export type {
  BehavioralEvent,
  BehavioralEventEnvelope,
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "./events/behavioral-event.js";
export type {
  CommerceEvent,
  CommerceEventEnvelope,
  CommerceEventPayload,
  CustomerRegisteredPayload,
  OrderCancelledPayload,
  OrderItemPayload,
  OrderPaidPayload,
  OrderPlacedPayload,
  RefundIssuedPayload,
} from "./events/commerce-event.js";
export { COMMERCE_EVENT_TYPES } from "./events/event-types.js";
export { CustomerAnalyticsProjection } from "./projections/customer-analytics-projection.js";
export { CustomerProjection } from "./projections/customer-projection.js";
export { FunnelProjection } from "./projections/funnel-projection.js";
export { OrderProjection } from "./projections/order-projection.js";

export { ProductAnalyticsProjection } from "./projections/product-analytics-projection.js";
export { RetentionProjection } from "./projections/retention-projection.js";
export { RevenueProjection } from "./projections/revenue-projection.js";
export { SessionBehaviorProjection } from "./projections/session-behavior-projection.js";
export type {
  CustomerAnalyticsQueryInput,
  CustomerAnalyticsQueryResult,
  CustomerAnalyticsSummary,
  TopCustomer,
  TopCustomersQueryInput,
} from "./queries/customer-analytics.js";
export {
  CustomerAnalyticsQuery,
  CustomerAnalyticsSummaryQuery,
  TopCustomersQuery,
} from "./queries/customer-analytics.js";
export type {
  FunnelQueryInput,
  FunnelSummary,
} from "./queries/funnel.js";
export {
  FunnelSessionQuery,
  FunnelSummaryQuery,
} from "./queries/funnel.js";

export type {
  ProductAnalyticsQueryInput,
  ProductAnalyticsQueryResult,
  ProductAnalyticsSummary,
  TopProductsQueryInput,
} from "./queries/product-analytics.js";

export {
  ProductAnalyticsQuery,
  ProductAnalyticsSummaryQuery,
  TopProductsQuery,
} from "./queries/product-analytics.js";
export type {
  RetentionCohortResult,
  RetentionPeriod,
  RetentionQueryInput,
  RetentionSummary,
} from "./queries/retention.js";
export {
  RetentionCohortQuery,
  RetentionSummaryQuery,
} from "./queries/retention.js";
export type {
  RevenueSummary,
  RevenueSummaryQueryInput,
} from "./queries/revenue.js";
export { RevenueSummaryQuery } from "./queries/revenue.js";
export type {
  SessionAnalyticsQueryInput,
  SessionAnalyticsQueryResult,
  SessionAnalyticsSummary,
} from "./queries/session-analytics.js";
export {
  EngagedSessionsQuery,
  SessionAnalyticsQuery,
  SessionAnalyticsSummaryQuery,
} from "./queries/session-analytics.js";

export type { CommerceEventValidationResult } from "./validation/commerce-event-validation.js";

export {
  assertValidCommerceEvent,
  CommerceEventValidationError,
  validateCommerceEvent,
} from "./validation/commerce-event-validation.js";
