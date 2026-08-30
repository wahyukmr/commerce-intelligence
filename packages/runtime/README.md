# Runtime Guide

`@ci/runtime` is the framework-independent execution core of the Commerce Intelligence Platform.

The runtime does not know about:

- React
- Vite
- charts
- ecommerce metrics
- dashboard components
- simulation
- persistence infrastructure

The runtime knows only the contracts required to:

1. Register projections.
2. Ingest events.
3. Maintain projection state.
4. Register queries.
5. Execute queries against a snapshot.
6. Create snapshots.
7. Restore snapshots.
8. Reset runtime state.

## Runtime Lifecycle

```text
Event
  ↓
Runtime
  ↓
Projection
  ↓
Projection State
  ↓
Snapshot
  ↓
Query
  ↓
Result
```

## Basic Usage

```ts
import {
  Runtime,
  type EventEnvelope,
  type Projection,
} from "@ci/runtime";
```

Create a runtime:

```ts
const runtime = new Runtime({
  tenantId: "tenant-1",
});
```

Register a projection:

```ts
runtime.registerProjection(projection);

Ingest events:

runtime.ingest(events);
```

Create a snapshot:

```ts
const snapshot = runtime.snapshot();
```

Register a query:

```ts
runtime.registerQuery(query);
```

Execute a query:

```ts
const result = runtime.query(
  "query-name",
  input,
);
```

## Tenant Isolation

A runtime instance belongs to exactly one tenant.

Events belonging to another tenant are ignored.

This establishes tenant context in V1 without requiring authentication, persistence, or a multi-tenant backend.

## Event Idempotency

The runtime tracks event identifiers.

If the same event identifier is ingested more than once, the second event is ignored.

This allows upstream adapters to retry delivery without causing duplicate projection updates.

## Projection Responsibilities

A projection:

- owns one state representation,
- receives events,
- returns the next state,
- serializes state for snapshots,
- restores state from snapshots.

A projection must not:

- access React,
- access the dashboard,
- perform network requests,
- access infrastructure,
- execute queries.

## Query Responsibilities

A query reads the runtime snapshot and produces a result.

A query must not mutate runtime state.

## Snapshot Responsibilities

A snapshot contains:

- runtime version,
- event sequence,
- processed event identifiers,
- event count,
- serialized projection states.

Persistence of snapshots is intentionally outside the runtime package.

A future infrastructure adapter may persist snapshots to:

- memory,
- IndexedDB,
- PostgreSQL,
- object storage,
- another persistence system.

The runtime contract remains unchanged.

## Error Handling

Duplicate projection and query names are rejected during registration.

Runtime-specific errors use `RuntimeError`.

## Design Constraint

`@ci/runtime` must remain usable without React, browser globals, or Node-specific APIs.
