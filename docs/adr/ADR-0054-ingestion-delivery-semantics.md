# ADR-0054 — Ingestion Delivery Semantics

## Status

* **Status:** Accepted
* **Date:** 2026-09-11
* **Updated:** 2026-09-13

## Context

The ingestion boundary previously reported only acceptance. Production integrations also need to distinguish a newly accepted event from an event that has already been delivered.

## Decision

Use two delivery outcomes at the ingestion boundary:

- `accepted`: the event was newly recorded and passed to the runtime.
- `duplicate`: the event was already recorded and is not applied again.

The event ID remains the idempotency key.

## Alternatives Considered

- Returning only HTTP status: rejected because it hides delivery semantics.
- Adding a distributed idempotency service now: rejected because infrastructure has not been selected.
- Letting every adapter implement duplicate handling: rejected because semantics must remain consistent across adapters.

## Consequences

Adapters can map the same outcome consistently. A durable event store can later replace the reference in-memory implementation without changing the delivery contract.

## Implementation Notes

`createRuntimeIngestionHandler()` optionally accepts an `EventStore`. When present, the event is durably appended before runtime ingestion. The append operation returns `inserted` or `duplicate`; both outcomes are safely passed through the runtime's event-id deduplication.

## Impact

This affects runtime input composition and makes event delivery semantics explicit.
