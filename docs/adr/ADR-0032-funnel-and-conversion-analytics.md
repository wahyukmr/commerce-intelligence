# ADR-0032 — Funnel and Conversion Analytics

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

The platform requires a behavioral funnel for understanding how visitors progress from session initiation to purchase.

The existing behavioral event model provides session, product-view, cart, and checkout events. The existing commerce model provides payment events.

A funnel read model is required to make stage progression queryable without rescanning raw events.

## Decision

Introduce `FunnelProjection`.

The V1 funnel consists of:

```text
session.started
product.viewed
cart.item_added
checkout.started
order.paid
```

The unit of analysis is the session.

Each stage is counted at most once per session.

A session can progress to a later stage only after reaching the preceding stage.

Conversion rates are calculated between consecutive stages:

```text
Conversion Rate = Count(To) / Count(From)
```

A zero denominator produces a conversion rate of zero.

Payment Attribution

The current `order.paid` contract does not contain `sessionId`.

Therefore exact session-level payment attribution is not possible.

V1 uses a provisional correlation rule based on:

- matching customer ID,
- an eligible session that reached checkout,
- deterministic selection.

The result is treated as an attribution heuristic, not authoritative session attribution.

## Alternatives Considered

### Attribute order payment directly to session

Rejected.

The event contract does not provide enough information to establish an exact relationship.

### Add sessionId to order.paid immediately

Rejected for this milestone.

Changing the existing event contract would expand the scope of the funnel milestone and could introduce compatibility concerns. The need for exact attribution will be evaluated as a separate event-contract decision.

### Calculate funnel directly from raw events

Rejected.

This would couple queries to raw-event volume and duplicate the progression logic for every consumer.

### Count every event instead of every session stage

Rejected.

A session can produce many product views, cart additions, or checkout events. Counting events would measure activity volume rather than funnel progression.

## Consequences

### Positive

- Funnel progression is incrementally maintained.
- Stage counts are deterministic.
- Duplicate behavioral events do not inflate conversion metrics.
- Funnel queries remain independent from dashboard implementation.

### Negative

- Final payment attribution is approximate in V1.
- The projection keeps session-level state in memory.
- Funnel semantics currently support only a fixed linear funnel.

## Implementation Notes

Projection:

```text
packages/commerce/src/projections/funnel-projection.ts
```

Queries:

```text
packages/commerce/src/queries/funnel.ts
```

The projection enforces stage ordering.

The query layer derives conversion rates from maintained counts.

## Impact

Affected:

- `@ci/commerce`
- future funnel dashboard widgets
- future conversion reporting
- simulation event generation

Not affected:

- generic runtime contracts
- existing revenue semantics
- existing customer analytics semantics
