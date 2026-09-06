# ADR-0031 — Session and Behavioral Events

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

The commerce analytics platform requires behavioral data to answer questions about product engagement, cart activity, checkout initiation, and future funnel performance.

Customer and order events alone cannot describe pre-purchase behavior.

Behavioral events must remain independent from order lifecycle events and must work for both anonymous visitors and identified customers.

## Decision

Introduce the following behavioral events:

- `session.started`
- `product.viewed`
- `cart.item_added`
- `checkout.started`

Each behavioral event carries:

- event identity,
- event version,
- occurrence timestamp,
- tenant identifier,
- session identifier,
- visitor identifier,
- optional customer identifier where applicable.

Behavioral state is maintained by:

```text
commerce.session-behavior
```

The projection maintains session-level facts including:

- activity timestamps,
- duration,
- product views,
- cart additions,
- checkout starts,
- acquisition context.

## Alternatives Considered

### Put behavioral events into order events

Rejected.

Behavior occurs before and independently of order lifecycle. Combining the two would produce oversized and semantically ambiguous event contracts.

### Track behavior only in the dashboard

Rejected.

Behavioral facts must be reusable by multiple consumers and must not depend on presentation code.

### Track only identified customers

Rejected.

Anonymous visitors are essential for funnel and acquisition analysis.

### Infer session behavior from orders

Rejected.

Orders do not contain enough information to reconstruct browsing and cart behavior.

## Consequences

### Positive

- Anonymous and identified behavior can be represented.
- Funnel capabilities have the required behavioral foundation.
- Session analytics remain independent from order lifecycle.
- Future simulation and production adapters can emit identical behavioral contracts.

### Negative
- The event catalog becomes larger.
- Session state consumes additional memory.
- A session-end event is not yet available, so duration is based on last observed activity.

## Implementation Notes

Behavioral events are defined in:

```text
packages/commerce/src/events/behavioral-event.ts
```

Session analytics is maintained by:

```text
packages/commerce/src/projections/session-behavior-projection.ts
```

Session duration is:

```text
lastActivityAt - startedAt
```

Out-of-order activity cannot move `lastActivityAt` backwards.

## Impact

Affected:

- `@ci/commerce`
- event validator
- future simulation adapter
- future funnel queries
- future engagement analytics

Not affected:

- `@ci/runtime`
- existing customer projection
- existing order projection
- existing revenue projection
