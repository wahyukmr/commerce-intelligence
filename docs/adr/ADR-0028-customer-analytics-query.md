# ADR-0028 — Customer Analytics Query

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

Customer analytics state is maintained by `CustomerAnalyticsProjection`.

Consumers require a stable read interface without depending directly on projection internals.

The first required consumer capabilities are customer detail, aggregate customer analytics, and ranking of customers by net revenue.

## Decision

Introduce three read-only customer analytics queries:

```text
commerce.customer.analytics
commerce.customer.analytics.summary
commerce.customer.analytics.top
```

`commerce.customer.analytics` retrieves analytics for a single customer.

`commerce.customer.analytics.summary` returns aggregate customer analytics.

`commerce.customer.analytics.top` returns customers ordered by descending net revenue.

The top-customer query defaults to a limit of ten.

Equal net revenue values are ordered by customer identifier ascending to ensure deterministic results.

## Alternatives Considered

### Expose CustomerAnalyticsProjectionState directly

Rejected.

Consumers would become coupled to projection storage details.

### Create one generic customer query with multiple modes

Rejected.

Separate query contracts make responsibilities and result semantics clearer.

### Perform ranking inside the dashboard

Rejected.

Ranking is a business read concern and must remain outside presentation logic.

## Consequences

### Positive

- Projection internals remain encapsulated.
- Dashboard and future consumers receive stable typed results.
- Query behavior can evolve independently from projection implementation.
- Deterministic ranking simplifies testing and consumer behavior.

### Negative

- Additional query classes increase the number of public domain contracts.
- Current top-customer query performs an in-memory sort over customer records.

## Implementation Notes

Implementations are located at:

```text
packages/commerce/src/queries/customer-analytics.ts
```

Queries operate against RuntimeSnapshot.

No query mutates runtime state.

Currency formatting remains outside the query layer.

## Impact

Affected:

- `@ci/commerce`
- future dashboard integration
- future customer reporting
- future retention and segmentation capabilities

Not affected:

- `@ci/runtime`
- commerce event contracts
- customer analytics projection semantics
