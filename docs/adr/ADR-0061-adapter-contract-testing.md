# ADR-0061 — Adapter Contract Testing

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
Multiple ingestion adapters must feed the same runtime contract. A new adapter should not silently diverge in lifecycle semantics.

## Decision
Use a small reusable contract helper that verifies the common lifecycle expectations of source adapters: start succeeds, duplicate start fails, stop succeeds, and the adapter reports its lifecycle state correctly.

The contract remains intentionally small. Event transformation and transport-specific behavior stay in adapter-specific tests.

## Alternatives Considered

### One large integration suite for all transports
Rejected because it would couple unrelated adapters.

### Full abstract base class
Rejected because the adapters do not share enough implementation to justify inheritance.

## Consequences
New adapters get a cheap, common lifecycle check without forcing a shared class hierarchy.

## Implementation Notes
The helper is test-oriented and does not become part of application runtime composition.

## Impact
Applies to source adapters implementing the runtime ingestion adapter contract.
