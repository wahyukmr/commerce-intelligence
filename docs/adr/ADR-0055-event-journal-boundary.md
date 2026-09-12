# ADR-0055 — Event Journal Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-11

## Context

The runtime currently keeps processed state in memory. Production recovery requires an event history that can be read independently of the runtime process.

## Decision

Introduce a generic `EventStore` contract in `@ci/runtime` with three operations:

- `has(eventId)`
- `append(event)`
- `readAll(tenantId?)`

Provide `InMemoryEventStore` as the reference and test implementation only.

## Alternatives Considered

- Hard-code PostgreSQL: rejected until deployment requirements are defined.
- Hard-code Kafka: rejected because a log broker is an infrastructure decision, not a runtime contract.
- Persist projection snapshots only: rejected because it does not provide an event history for deterministic rebuilds.

## Consequences

The runtime can be paired with durable storage later without changing the event contract. The in-memory implementation is not itself a production durability solution.

## Implementation Notes

Store ownership remains outside the projection implementation. The store records canonical `EventEnvelope` values.

## Impact

Input composition gains an explicit event-history boundary.
