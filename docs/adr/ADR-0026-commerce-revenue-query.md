# ADR-0026 — Commerce Revenue Query

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

The commerce runtime needs a stable read interface for revenue information.

The dashboard and future consumers should not access projection internals directly or calculate revenue from raw events.

Revenue projection owns the maintained revenue state, while a query should translate that state into a consumer-facing business result.

## Decision

Revenue is exposed through `RevenueSummaryQuery`.

Its query name is:

```text
commerce.revenue.summary
```

The query reads the `commerce.revenue` projection from `RuntimeSnapshot`.

The query returns:

- currency,
- paid order count,
- gross revenue,
- refund count,
- refunded revenue,
- net revenue.

Refund information may be excluded through:

```ts
{
  includeRefunds: false
}
```

Queries remain read-only.

## Alternatives Considered

### Dashboard reads projection state directly

Rejected.

It couples the presentation layer to runtime internals and prevents other consumers from using a stable business-facing interface.

### Dashboard calculates revenue

Rejected.

Business computation must remain outside the presentation layer.

### Query reads raw events

Rejected.

Revenue projection already exists specifically to maintain the required aggregate state without rescanning the complete event history.

### Query mutates projection state

Rejected.

A query is a read operation and must not modify runtime state.

## Consequences

### Positive

- Dashboard consumers receive a typed business result.
- Projection internals remain encapsulated.
- Query behavior can evolve independently from projection storage.
- Future consumers such as API endpoints and reporting systems can reuse the same query.

### Negative

- Query registration is required before execution.
- Query implementation currently depends on the runtime snapshot representation.

## Implementation Notes

The implementation is located at:

```text
packages/commerce/src/queries/revenue.ts
```

The query expects the `commerce.revenue` projection to be registered.

The query does not format money. Formatting remains a presentation concern.

## Impact

Affected:

- `@ci/commerce`
- future dashboard integration
- future reporting consumers

Not affected:

- `@ci/runtime` contracts
- RevenueProjection state semantics
- commerce event contracts
