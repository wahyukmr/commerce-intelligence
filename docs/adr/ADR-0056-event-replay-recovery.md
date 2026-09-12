# ADR-0056 — Event Replay and Recovery

## Status

* **Status:** Accepted
* **Date:** 2026-09-11

## Context

Once events have an independent journal, a fresh runtime must be able to rebuild its projections from that history.

## Decision

Provide `replayEventStore(store, runtime, options)` as the generic recovery operation. The function reads events in store order and sends them through the same `Runtime.ingest()` path used by live ingestion.

## Alternatives Considered

- Reimplement projection rebuild logic separately: rejected because it would create two state-application paths.
- Restore projection internals directly: rejected because it bypasses runtime invariants.
- Add background recovery orchestration now: rejected because scheduling and infrastructure are deployment concerns.

## Consequences

Recovery reuses existing runtime behavior. Performance and checkpointing remain future infrastructure work.

## Implementation Notes

Tenant filtering is supported. The supplied runtime remains responsible for tenant validation and event deduplication.

## Impact

Production recovery can rebuild a runtime instance without changing projection implementations.
