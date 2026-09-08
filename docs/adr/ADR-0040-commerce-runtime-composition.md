# ADR-0040: Commerce Runtime Composition

## Status

* **Status:** Accepted
* **Date:** 2026-09-07

## Context

M3 established the commerce event model, projections, and queries. M4 connected synthetic events to the runtime and dashboard through worker-based simulation.

The dashboard composition still required each consumer to manually construct commerce projections. That creates unnecessary duplication and makes it possible for different consumers to expose different projection sets accidentally.

The system needs one canonical composition root for commerce projections while keeping read-side query composition flexible.

## Decision

Introduce `createCommerceRuntimeComposition()` in `@ci/commerce`.

The factory owns the canonical projection set:

- CustomerProjection
- OrderProjection
- RevenueProjection
- CustomerAnalyticsProjection
- ProductAnalyticsProjection
- SessionBehaviorProjection
- FunnelProjection
- RetentionProjection

Query implementations remain injectable through the factory options.

The factory creates the `@ci/runtime` instance and registers the canonical projections before registering consumer-supplied queries.

## Alternatives Considered

### Construct projections in the dashboard

Rejected because application composition would duplicate domain wiring and could drift between consumers.

### Make queries global singletons

Rejected because queries are runtime-bound read models and global instances create unnecessary lifecycle coupling.

### Move all query implementations into the runtime package

Rejected because the runtime remains generic and framework-independent. Commerce-specific query logic belongs to `@ci/commerce`.

## Consequences

Commerce projection wiring has one canonical location.

The dashboard no longer needs to know individual projection constructors.

Tests can compose only the queries they need.

Query composition remains explicit rather than hidden behind global state.

## Implementation Notes

The factory is exported through `@ci/commerce`.

The package must preserve the public API boundary and consumers must not import internal projection paths.

Future production adapters can use the same factory without changing the projection composition.

## Impact

Affected package:

- `@ci/commerce`

Affected consumers:

- `apps/dashboard`
- simulation integration
- future production ingestion adapters
