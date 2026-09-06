# ADR-0033 — Customer Purchase Retention

* **Status:** Accepted
* **Date:** 2026-09-03

## Context

The platform requires retention analytics to understand whether customers who make a first purchase return and make additional purchases.

Retention can be derived from confirmed payment events without requiring behavioral-session data.

A separate projection is required so retention calculations do not become part of the customer identity projection or revenue projection.

## Decision

Introduce `RetentionProjection`.

Retention is customer-based.

A customer's cohort is the calendar week containing their first `order.paid` event.

The cohort week starts Monday at 00:00 UTC.

A customer is considered active in a later retention period when the customer has at least one `order.paid` event during that calendar week.

Multiple paid orders by the same customer in one week count once.

Retention rate is:

```text
Active Customers in Period /
Customers in Cohort
```

## Alternatives Considered

### Session-based retention

Rejected for V1.

Session behavior measures engagement, while the initial retention capability is intended to answer whether customers return to purchase.

### Revenue-based retention

Rejected.

Revenue retention requires different semantics, especially treatment of refunds, expansion, contraction, and currency.

### Daily retention

Rejected for V1.

Weekly cohorts provide a more manageable initial analytical model and reduce sparsity.

### Calculate retention directly from raw events

Rejected.

Repeated raw-event scanning would make the query increasingly dependent on event volume.

## Consequences

### Positive

- Customer purchase retention can be calculated incrementally.
- Cohort membership remains stable.
- Multiple purchases in a week do not inflate active customer counts.
- Retention remains independent from session behavior.

### Negative

- V1 uses UTC calendar weeks.
- No configurable cohort period exists yet.
- Churn prediction is outside the current capability.

## Implementation Notes

Projection:

```text
packages/commerce/src/projections/retention-projection.ts
```

Queries:

```text
packages/commerce/src/queries/retention.ts
```

Cohort week starts Monday at 00:00 UTC.

The first `order.paid` establishes customer cohort membership.

## Impact

Affected:

- `@ci/commerce`
- future retention dashboard
- future customer lifecycle analysis

Not affected:

- revenue projection
- customer identity projection
- session analytics
- funnel semantics
