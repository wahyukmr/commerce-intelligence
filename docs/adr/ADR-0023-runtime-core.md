# ADR-0023 — Runtime Core

* **Status:** Accepted
* **Date:** 2026-09-01

## Context

The Commerce Intelligence Platform requires a framework-independent execution core that can consume commerce events, maintain derived state through projections, expose read-only queries, and support snapshot creation and restoration.

V1 uses synthetic events, while future versions may receive events through HTTP, webhooks, queues, streaming systems, or other infrastructure.

The runtime therefore must not depend on the source of events or the presentation layer.

## Decision

The platform uses `@ci/runtime` as the framework-independent runtime boundary.

The runtime is responsible for:

- Event ingestion.
- Projection registration.
- Projection state management.
- Query registration.
- Query execution.
- Snapshot creation.
- Snapshot restoration.
- Runtime reset.
- Per-runtime tenant scoping.
- Event-idempotency.

The runtime is not responsible for:

- Event transport.
- Event persistence.
- Snapshot persistence.
- Authentication.
- Authorization.
- React.
- UI rendering.
- Commerce-specific analytics definitions.
- Simulation.

Runtime snapshots record the tenant identifier associated with the runtime.

A runtime may only restore a snapshot that belongs to its tenant.

Resetting runtime state preserves the runtime tenant context.

Projection and query behavior are supplied through explicit contracts.

## Alternatives Considered

### Runtime tied directly to React

Rejected.

The runtime must be usable by dashboard applications, backend services, workers, CLI applications, and future SDK consumers.

### Runtime owns domain-specific analytics

Rejected.

The runtime must remain generic so commerce capabilities can evolve independently.

### Event store inside the runtime

Rejected.

Event persistence is an infrastructure concern. V1 runtime operates on supplied events and maintains only the state required for execution.

### Query mutates runtime state

Rejected.

Queries are read operations and must not change runtime state.

## Consequences

### Positive

- Runtime is framework-independent.
- Simulation can later be replaced by production event adapters.
- Commerce capabilities remain outside the runtime.
- Queries remain read-only.
- Runtime can be tested without the dashboard.
- Snapshot persistence can be introduced independently.

### Negative

- Infrastructure integration requires explicit adapters.
- Some functionality that could be convenient inside the runtime must remain outside it.

## Implementation Notes

The runtime exposes:

```ts
new Runtime({
  tenantId,
});
```

Core operations are:

```ts
registerProjection()
registerQuery()
ingest()
query()
snapshot()
restore()
reset()
```

Event identity is defined by `EventEnvelope.id`. Events from another tenant are ignored. Duplicate event identifiers are ignored.

`RuntimeState` receives the tenant identifier at construction time.

Snapshots contain exactly the runtime tenant identifier in `tenantIds`.

Restore rejects snapshots that do not contain the current runtime tenant.

## Impact

Affected:

- `@ci/runtime`.
- Future `@ci/commerce`.
- Future `@ci/simulation`.
- Future infrastructure adapters.
- Dashboard query integration.

Not affected:

- React component architecture.
- Dashboard visual design.
- Simulation behavior.
- Production transport choice.
