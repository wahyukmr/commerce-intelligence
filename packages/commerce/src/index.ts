export * from "./compositions/index";
export type {
  Customer,
  CustomerProjectionState,
} from "./domain/customer";
export type {
  CustomerAnalytics,
  CustomerAnalyticsProjectionState,
} from "./domain/customer-analytics";
export type {
  FunnelConversion,
  FunnelCounts,
  FunnelProjectionState,
  FunnelSession,
  FunnelStage,
} from "./domain/funnel";
export type {
  Order,
  OrderItem,
  OrderProjectionState,
  OrderStatus,
} from "./domain/order";
export type {
  Product,
  ProductAnalytics,
  ProductAnalyticsProjectionState,
} from "./domain/product";
export type {
  CustomerRetentionRecord,
  RetentionCohort,
  RetentionProjectionState,
} from "./domain/retention";
export type { RevenueProjectionState } from "./domain/revenue";
export type {
  SessionAnalytics,
  SessionBehaviorProjectionState,
} from "./domain/session";
export type {
  BehavioralEvent,
  BehavioralEventEnvelope,
  CartItemAddedPayload,
  CheckoutStartedPayload,
  ProductViewedPayload,
  SessionStartedPayload,
} from "./events/behavioral-event";
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
} from "./events/commerce-event";
export { COMMERCE_EVENT_TYPES } from "./events/event-types";
export { CustomerAnalyticsProjection } from "./projections/customer-analytics-projection";
export { CustomerProjection } from "./projections/customer-projection";
export { FunnelProjection } from "./projections/funnel-projection";
export { OrderProjection } from "./projections/order-projection";
export { ProductAnalyticsProjection } from "./projections/product-analytics-projection";
export { RetentionProjection } from "./projections/retention-projection";
export { RevenueProjection } from "./projections/revenue-projection";
export { SessionBehaviorProjection } from "./projections/session-behavior-projection";
export type {
  CustomerAnalyticsQueryInput,
  CustomerAnalyticsQueryResult,
  CustomerAnalyticsSummary,
  TopCustomer,
  TopCustomersQueryInput,
} from "./queries/customer-analytics";
export {
  CustomerAnalyticsQuery,
  CustomerAnalyticsSummaryQuery,
  TopCustomersQuery,
} from "./queries/customer-analytics";
export type {
  FunnelQueryInput,
  FunnelSummary,
} from "./queries/funnel";
export {
  FunnelSessionQuery,
  FunnelSummaryQuery,
} from "./queries/funnel";
export type {
  ProductAnalyticsQueryInput,
  ProductAnalyticsQueryResult,
  ProductAnalyticsSummary,
  TopProductsQueryInput,
} from "./queries/product-analytics";
export {
  ProductAnalyticsQuery,
  ProductAnalyticsSummaryQuery,
  TopProductsQuery,
} from "./queries/product-analytics";
export type {
  RetentionCohortResult,
  RetentionPeriod,
  RetentionQueryInput,
  RetentionSummary,
} from "./queries/retention";
export {
  RetentionCohortQuery,
  RetentionSummaryQuery,
} from "./queries/retention";
export type {
  RevenueSummary,
  RevenueSummaryQueryInput,
} from "./queries/revenue";
export { RevenueSummaryQuery } from "./queries/revenue";
export type {
  SessionAnalyticsQueryInput,
  SessionAnalyticsQueryResult,
  SessionAnalyticsSummary,
} from "./queries/session-analytics";
export {
  EngagedSessionsQuery,
  SessionAnalyticsQuery,
  SessionAnalyticsSummaryQuery,
} from "./queries/session-analytics";
export type { CommerceEventValidationResult } from "./validation/commerce-event-validation";
export {
  assertValidCommerceEvent,
  CommerceEventValidationError,
  validateCommerceEvent,
} from "./validation/commerce-event-validation";
