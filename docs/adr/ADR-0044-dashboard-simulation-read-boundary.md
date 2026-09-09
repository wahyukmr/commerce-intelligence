# ADR-0044: Dashboard Simulation Read Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-08

## Context

The simulation controller previously exposed and used `Runtime.query()` directly. That bypassed the dashboard read boundary and left two competing query access paths in the application.

## Decision

`useSimulation()` now receives a `DashboardComposition` factory instead of a runtime factory.

The simulation controller uses the composition as follows:

- `composition.runtime.ingest()` for generated event ingestion;
- `composition.runtime.snapshot()` for runtime state inspection;
- `composition.queryService.execute()` for dashboard analytics reads.

The controller does not construct query implementations or perform commerce calculations.

## Alternatives Considered

### Add a second query abstraction inside simulation

Rejected because it duplicates the dashboard read boundary.

### Move simulation control into `@ci/commerce`

Rejected because Worker and React lifecycle concerns belong to the dashboard application.

## Consequences

The simulation feature and normal dashboard consumers now share one query read path.

The runtime remains the ingestion and execution engine, while the query service remains the dashboard read boundary.

## Implementation Notes

The migration is limited to `apps/dashboard/src/simulation/use-simulation.ts` and its test contract.

Existing runtime composition remains unchanged.

## Impact

Affected area:

- `apps/dashboard/src/simulation`
