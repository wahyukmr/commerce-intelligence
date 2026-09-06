# ADR-0034 — Commerce Runtime Integration Testing

* **Status:** Accepted
* **Date:** 2026-09-03

## Context

Individual commerce projections and queries have independent unit tests.

Unit tests alone cannot guarantee that all projections, queries, event contracts, tenant filtering, and snapshot behavior work correctly when combined inside the same runtime.

A deterministic integration suite is therefore required before introducing the simulation adapter.

## Decision

Introduce a commerce runtime integration test.

The integration test uses a single `Runtime` configured for one tenant and registers all current commerce projections and queries.

The suite verifies:

- simultaneous projection execution,
- event-stream compatibility,
- cross-capability query consistency,
- tenant isolation,
- snapshot restoration,
- projection isolation.

The integration test remains independent from React, dashboard rendering, and production transport.

## Alternatives Considered

### Rely only on unit tests

Rejected.

Unit tests cannot detect integration failures between otherwise correct projections, runtime behavior, query registration, and snapshot restoration.

### Integrate through the dashboard

Rejected.

That would couple runtime validation to presentation code and make failures harder to isolate.

### Use production infrastructure for integration tests

Rejected for V1.

The core runtime can be verified deterministically without network, database, queue, or external services.

## Consequences

### Positive

- Runtime and commerce integration failures are detected early.
- Snapshot and tenant behavior are verified across the complete stack.
- Simulation can be introduced on top of a verified runtime.

### Negative

- Integration tests require maintaining a representative event stream.
- Every new commerce projection/query should be evaluated for inclusion in the integration suite.

## Implementation Notes

Integration suite:

```text
packages/commerce/src/integration/commerce-runtime.integration.test.ts
```

The test registers all current commerce projections and queries and executes a deterministic event stream.

## Impact

Affected:

- `@ci/commerce`
- `@ci/runtime`
- future simulation adapter

Not affected:

- dashboard UI
- production transport
- external persistence
