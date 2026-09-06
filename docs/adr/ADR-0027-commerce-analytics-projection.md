# ADR-0027 — Customer Analytics Projection

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

Customer analytics requires information that is derived from the customer's purchase history rather than from the customer registration record alone.

The existing `CustomerProjection` represents the customer domain record. It should not become responsible for every analytics concern associated with a customer.

A separate customer analytics projection is therefore required to maintain purchase-related facts efficiently.

## Decision

Introduce `CustomerAnalyticsProjection`.

The projection consumes:

- `order.paid`
- `refund.issued`

It maintains per-customer:

- first purchase timestamp,
- last purchase timestamp,
- paid order count,
- lifetime revenue,
- refunded revenue,
- net revenue,
- repeat purchase count,
- average order value.

It also maintains the projection currency and the number of customers with at least one paid order.

The existing `CustomerProjection` remains responsible for customer identity and registration information.

## Alternatives Considered

### Add all analytics fields to CustomerProjection

Rejected.

This would make the customer domain projection responsible for both customer state and analytical read-model concerns.

### Recalculate customer analytics from raw events

Rejected.

Repeated raw-event scanning does not scale with event volume and would move business computation into query execution.

### Create one large CustomerAnalyticsProjection containing every future customer metric

Rejected.

The projection should contain facts needed by current capabilities, not speculative metrics.

## Consequences

### Positive

- Customer domain state and customer analytics state remain separate.
- Customer analytics can evolve without changing the customer identity projection.
- Repeat purchase and LTV calculations can be performed incrementally.
- Future retention queries can consume customer purchase facts.

### Negative

- The runtime now maintains two customer-related projections.
- Additional memory is required for the customer analytics read model.

## Implementation Notes

Implementation:

```text
packages/commerce/src/projections/customer-analytics-projection.ts
```

The projection is registered independently:

```ts
runtime.registerProjection(
  new CustomerAnalyticsProjection(),
);
```

`CustomerProjection` must not be modified to absorb these analytics responsibilities.

## Impact

Affected:

`@ci/commerce`
- future customer analytics queries
- future retention capabilities
- future customer segmentation

Not affected:

- runtime contracts
- event envelope
- existing customer identity model
- order lifecycle contracts
