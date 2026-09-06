# ADR-0024 — Commerce Event Model

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

The analytics runtime requires a stable business-event contract that can be produced by the V1 simulation adapter and later consumed from production commerce systems.

The event model must describe commerce behavior independently of transport, framework, or storage.

The first implemented commerce capabilities require customer registration and order lifecycle events.

## Decision

Commerce events use immutable, versioned domain events carried by the `@ci/runtime` event envelope.

The V1 event catalog contains:

- `customer.registered`
- `order.placed`
- `order.paid`
- `order.cancelled`
- `refund.issued`

Each event contains:

- unique event identifier,
- event type,
- schema version,
- occurrence timestamp,
- tenant identifier,
- typed payload,
- optional metadata.

Transport information is not represented as a domain event type.

## Alternatives Considered

### Transport-oriented events

Examples:

```text
webhook.received
http.request.completed
kafka.message.received
```

Rejected.

These describe infrastructure activity rather than commerce behavior and would couple the event model to a specific ingestion mechanism.

### Mutable event records

Rejected.

Analytics projections depend on deterministic event history. Corrections should be represented through subsequent domain events rather than rewriting historical events.

### One generic untyped event payload

Rejected.

It weakens compile-time guarantees and moves validation into runtime code.

## Consequences

### Positive

- Simulation and production adapters can emit the same event contracts.
- Commerce behavior is independent of transport.
- Projection code can use discriminated unions.
- Event versioning can evolve explicitly.

### Negative

- New event types require an explicit contract change.
- Historical compatibility must be considered whenever event schemas evolve.

## Implementation Notes

Commerce event types are defined in:

```text
packages/commerce/src/events/
```

`CommerceEvent` is a discriminated union keyed by `type`.

Event payloads are readonly.

## Impact

Affected:

- `@ci/commerce`
- future simulation adapter
- future ingestion adapters
- projections
- query layer

Not affected:

- React dashboard
- visualization
- infrastructure transport
