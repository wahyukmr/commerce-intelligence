# ADR-0066 — Durable Event Journal

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
The runtime has an EventStore contract and an in-memory reference implementation, but a production deployment requires durable storage for event recovery.

## Decision
Use PostgreSQL as the first concrete durable event journal implementation at the application infrastructure boundary. `@ci/runtime` remains persistence agnostic.

## Alternatives Considered
- Redis streams: not selected as the primary journal because the current requirement is durable event history and replay.
- Kafka: not selected before a stream-scale requirement exists.
- Database-specific code inside runtime: rejected because it would violate the runtime dependency boundary.

## Consequences
- Application infrastructure gains a PostgreSQL dependency.
- Runtime code remains reusable with other stores.
- Event history can survive application restarts.

## Implementation Notes
The event journal uses an ordered `BIGSERIAL` sequence, globally unique event IDs, tenant-scoped indexes, and JSONB payload/metadata.
