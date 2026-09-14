# ADR-0063 — REST Cursor Persistence Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Decision
The REST event source adapter may use a `RestEventCursorStore` to persist and restore its polling cursor. The runtime package owns only the contract and an in-memory reference implementation. Durable infrastructure remains outside the adapter package.

## Consequences
A process restart can resume from the last successfully persisted cursor when a durable implementation is supplied. A cursor is persisted only after all events in the fetched page have been delivered successfully.
