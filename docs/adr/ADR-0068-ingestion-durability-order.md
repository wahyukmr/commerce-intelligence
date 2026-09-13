# ADR-0068 — Durability Before Runtime Ingestion

## Status

* **Status:** Accepted
* **Date:** 2026-09-13


## Context
The previous ingestion order applied an event to the in-memory runtime before persisting it. A process crash between those operations could leave runtime state ahead of the durable event journal.

## Decision
When a durable EventStore is configured, ingestion persists the event first and then applies it through Runtime.ingest(). The EventStore append operation is atomic for the event ID and returns `inserted` or `duplicate`.

The runtime remains idempotent, so an already persisted event can safely be passed through Runtime.ingest() during retries or recovery-adjacent delivery.

## Consequences
- A persistence failure prevents the event from being applied to runtime state.
- A runtime processing failure leaves a durable event that can be replayed later.
- The ingestion receipt is emitted only after both persistence and runtime application succeed.
