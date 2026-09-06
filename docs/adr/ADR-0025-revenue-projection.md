# ADR-0025 — Revenue Projection

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

The platform requires a stable revenue read model that can be consumed by future analytics queries without repeatedly scanning raw commerce events.

Revenue must reflect confirmed payments and issued refunds.

The first V1 implementation operates on a single reporting currency per runtime.

## Decision

Revenue is maintained by `RevenueProjection`.

The projection consumes:

- `order.paid`
- `refund.issued`

The projection maintains:

- currency
- paid order count
- gross revenue
- refund count
- refunded revenue
- net revenue

Definitions:

```text
Gross Revenue = Σ order.paid.amount

Refunded Revenue = Σ refund.issued.amount

Net Revenue = Gross Revenue - Refunded Revenue
```

The projection operates on one currency.

A currency mismatch is treated as an invalid projection state and causes an error.

## Alternatives Considered

### Calculate revenue directly from raw events during every query

Rejected.

Repeated event scanning would increase query cost and couple query execution to raw event volume.

### Store only net revenue

Rejected.

Gross revenue and refunded revenue are independently meaningful business facts and are required for further analysis.

### Support multi-currency immediately

Rejected for V1.

Currency normalization introduces exchange-rate semantics, valuation timestamps, conversion source, and reporting policies that are outside the current product scope.

### Calculate revenue inside the dashboard

Rejected.

Business calculations must remain outside the presentation layer.

## Consequences

### Positive

- Revenue queries can operate on a compact projection.
- Gross, refund, and net revenue remain independently available.
- Dashboard code does not contain revenue business logic.
- Currency inconsistencies are detected early.

### Negative

- V1 cannot combine multiple currencies within one revenue projection.
- A future multi-currency capability will require an explicit design.

## Implementation Notes

The implementation is:

```text
packages/commerce/src/projections/revenue-projection.ts
```

The projection is registered with the runtime like any other projection.

Event-level deduplication is delegated to `@ci/runtime`.

## Impact

Affected:

- `@ci/commerce`
- future revenue queries
- future dashboard revenue widgets

Not affected:

- runtime contracts
- event envelope
- order lifecycle
- simulation transport
