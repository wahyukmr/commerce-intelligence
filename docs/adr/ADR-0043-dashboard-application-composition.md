# ADR-0043: Dashboard Application Composition

## Status

* **Status:** Accepted
* **Date:** 2026-09-08

## Context

The remaining application-level gap is the composition boundary between these pieces. The dashboard still needs a single place that selects query implementations, creates the query composition, creates the commerce runtime, and exposes the read service.

The previous dashboard helper also grouped arbitrary queries by inspecting their name prefixes. That couples application composition to naming conventions and can silently place a query in the wrong domain.

## Decision

Introduce `createDashboardComposition()` under `apps/dashboard/src/runtime` as the dashboard application composition root.

It accepts `CommerceQueryCompositionInput`, which requires callers to explicitly provide query implementations under the correct commerce domain.

The composition root performs exactly three wiring steps:

1. create the immutable commerce query composition;
2. pass `composition.all` to `createCommerceRuntimeComposition()`;
3. construct `CommerceDashboardQueryService` with the runtime and composition.

The existing `createRuntime()` helper remains as a compatibility helper for code that only requires a runtime. It delegates to `createDashboardComposition()` and contains no independent composition logic.

## Alternatives Considered

### Continue grouping queries from their names

Rejected because the domain boundary becomes an implicit naming convention and invalid composition can pass silently.

### Construct queries inside the dashboard composition root

Rejected because query implementation ownership belongs to the query layer, not to the wiring function.

### Move dashboard composition into `@ci/commerce`

Rejected because application-level dependency selection belongs to the application composition root. The commerce package should remain reusable by multiple consumers.

### Create a second runtime or read-service abstraction

Rejected because M4.7 and M4.9 already provide the required runtime and query read boundaries.

## Consequences

The dashboard has one canonical composition path.

Query domains are explicit at the call site.

Runtime and query-service construction cannot drift apart through repeated application setup.

The runtime remains generic and commerce-agnostic.

The compatibility helper can be removed later once all dashboard consumers migrate to the full composition object.

## Implementation Notes

Public dashboard runtime exports are exposed through `apps/dashboard/src/runtime/index.ts`.

New application code should prefer `createDashboardComposition()`.

Query implementations remain outside this milestone; this milestone only wires already-existing implementations.

## Impact

Affected area:

- `apps/dashboard/src/runtime`
