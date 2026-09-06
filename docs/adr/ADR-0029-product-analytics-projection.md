# ADR-0029 — Product Analytics Projection

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

The platform requires product-level read models for product performance analysis.

The current commerce event contract provides product-level item details through `order.placed`, but `order.paid` only provides an order-level payment amount.

Deriving product-level confirmed revenue from the current event model would therefore require an undocumented allocation rule.

Such an assumption would make the metric semantically unreliable.

## Decision

Introduce `ProductAnalyticsProjection`.

The projection consumes `order.placed` events and maintains:

- product identifier,
- order count,
- units ordered,
- merchandise value,
- average unit price.

`merchandiseValue` is explicitly defined as:

```text
Σ(item.quantity × item.unitPrice)
```

The value is not considered confirmed revenue.

Product-level confirmed revenue, product-level refunds, and product-level net revenue are outside the current V1 capability.

## Alternatives Considered

### Allocate order payment proportionally across products

Rejected.

A proportional allocation would be an artificial accounting rule and would not reliably represent discounts, taxes, shipping, bundles, promotions, or other order-level adjustments.

### Reuse order total as product revenue

Rejected.

An order total has no inherent product-level allocation.

### Calculate product analytics from raw events at query time

Rejected.

Repeated event scanning would scale poorly and move aggregation into query execution.

### Wait until V2

Rejected.

Basic product ordering and unit analysis are useful V1 capabilities and can be implemented correctly without making unsupported revenue assumptions.

## Consequences

### Positive

- Product analytics remain semantically defensible.
- Product-level unit and merchandise metrics can be computed incrementally.
- Future confirmed-revenue support can be added through an explicit event-contract decision.

### Negative

- V1 cannot report authoritative product-level confirmed revenue.
- Product-level refund analytics are also unavailable.
Implementation Notes

## Implementation:

```text
packages/commerce/src/projections/product-analytics-projection.ts
```

The query layer exposes:

```text
commerce.product.analytics
commerce.product.analytics.summary
commerce.product.analytics.to
```

The term merchandiseValue must not be replaced by revenue without a new architectural decision.

## Impact

Affected:

- `@ci/commerce`
- future product dashboard
- future inventory analytics
- future product ranking

Not affected:

- runtime contract
- existing revenue projection
- order payment semantics
