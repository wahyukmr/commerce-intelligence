# ADR-0071 — Recovery Checkpoint and Snapshot Atomicity

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
A sequence-only recovery checkpoint cannot rebuild an in-memory runtime because projection state from events before the checkpoint would be missing. A snapshot-only checkpoint has the same consistency problem if the snapshot and sequence diverge.

## Decision
Persist the recovery sequence and the corresponding RuntimeSnapshot as one durable state record. Recovery restores that snapshot and continues reading the event journal strictly after the stored sequence. After each successfully processed page, the new snapshot and sequence are persisted together in one upsert operation.

The checkpoint is a recovery optimization, not the source of truth. The durable event journal remains authoritative.

## Consequences
- Restart recovery does not need to replay the complete journal after a completed checkpoint.
- A crash before checkpoint persistence safely replays the last uncheckpointed page from the previous snapshot.
- Runtime recovery remains bounded by the configured page size.
- Live ingestion does not need to update the recovery checkpoint on every event.
