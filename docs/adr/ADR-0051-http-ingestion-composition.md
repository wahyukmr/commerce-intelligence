# ADR-0051 — HTTP Ingestion Composition

## Status

* **Status:** Accepted
* **Date:** 2026-09-10

## Context

Defined the production ingestion contract, event-envelope validation, an HTTP webhook adapter, signature verification, and replay protection. The remaining application concern is wiring those pieces to one existing `Runtime` instance without making the adapter responsible for runtime ownership.

## Decision

Introduce `createHttpIngestionComposition()` in `@ci/runtime`.

The composition creates a `RuntimeIngestionHandler` around the application-provided runtime and installs that handler into the application-provided HTTP webhook adapter.

The composition owns adapter lifecycle but does not own the runtime lifecycle.

## Alternatives Considered

### Let the adapter construct Runtime
Rejected because the adapter would become coupled to runtime ownership and would no longer be a reusable transport boundary.

### Put composition in the dashboard
Rejected as the generic adapter-to-runtime connection is reusable outside the dashboard and contains no commerce-specific behavior.

### Add an ingestion pipeline/dispatcher layer
Rejected as unnecessary for the current system. The existing handler is sufficient.

## Consequences

The production path is explicit and testable. The HTTP adapter remains transport-specific while the runtime remains transport-agnostic.

The application still controls the runtime instance and therefore tenant/application lifecycle.

## Implementation Notes

The composition does not create an HTTP server. The host framework owns the network listener and forwards `Request` objects to the composition.

## Impact

Positive: clearer lifecycle ownership and a complete production input path.

No changes are required to projections, queries, commerce contracts, or simulation.
