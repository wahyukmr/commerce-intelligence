# ADR-0045: Dashboard Application Lifecycle Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-08

## Context

Moved simulation analytics reads behind `CommerceDashboardQueryService`, but `useSimulation()` still accepted a composition factory and created its own composition.

That leaves ownership ambiguous. A feature can accidentally create a second runtime, which would separate simulation ingestion from dashboard reads.

## Decision

`useSimulation()` consumes an application-owned `DashboardComposition` instance.

The hook must not create, replace, or own the lifetime of the dashboard composition. The application composition root is responsible for creating and stabilizing that instance.

The hook may own the simulation worker lifecycle because the worker is a feature-local execution resource.

## Alternatives Considered

### Create composition inside the hook

Rejected. It allows duplicate runtimes and makes application-wide state ownership unclear.

### React Context for composition

Deferred. Context is not required to establish the ownership boundary and would add a transport mechanism before the dashboard actually needs deep component-tree dependency injection.

### Global singleton composition

Rejected. A singleton would make tenant isolation, lifecycle, testing, and multiple dashboard instances harder to reason about.

## Consequences

Positive:

- one runtime instance per dashboard application composition;
- simulation ingestion and analytics reads share the same state;
- feature code cannot accidentally construct a second composition;
- application lifecycle ownership is explicit.

Negative:

- application code must create and stabilize the composition;
- changing tenant context requires replacing the composition at the application boundary rather than from inside the simulation hook.

## Implementation Notes

The public `UseSimulationOptions` contract contains `composition`, not `createComposition`.

The hook stores the initial composition reference and rejects a changed reference during its lifetime. This protects the runtime/query invariant instead of silently switching state underneath an active worker.

## Impact

This decision affects the dashboard simulation integration only. It does not change `@ci/runtime`, `@ci/commerce`, or the simulation worker protocol.
