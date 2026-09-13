# ADR-0067 — Runtime Recovery From Event Journal

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
Projection state is process-local. A production process must be able to reconstruct projection state after restart or state loss.

## Decision
Recovery reads tenant-scoped events in journal sequence order and applies them through the normal `Runtime.ingest()` path.

## Alternatives Considered
- Separate recovery projection APIs: rejected because they create a second state-building path.
- Query-level reconstruction: rejected because query code should consume runtime state rather than rebuild it.

## Consequences
- Recovery behavior remains identical to normal ingestion semantics.
- Replay time grows with journal size until checkpointing is introduced.
- Future checkpoints can optimize recovery without changing the event model.
