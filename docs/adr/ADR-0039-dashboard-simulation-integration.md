# ADR-0039: Dashboard Simulation Integration

## Status

* **Status:** Accepted
* **Date:** 2026-09-07

## Context

The dashboard now needs to consume generated chunks and expose analytics without duplicating runtime logic in React components.

The runtime must remain the authoritative state holder for projection updates and queries.

## Decision

Introduce a dashboard application-layer `useSimulation` controller.

The controller:

- owns the simulation worker client
- owns a runtime instance supplied through `createRuntime`
- resets the runtime before each simulation
- ingests each emitted chunk into the runtime
- exposes worker lifecycle state
- exposes cancellation and reset
- exposes runtime query and snapshot access

The controller does not implement commerce analytics calculations.

The worker remains responsible only for event generation and streaming.

## Alternatives Considered

### Generate events directly inside React

Rejected because it blocks the UI architecture around simulation concerns and bypasses the existing worker boundary.

### Put the runtime inside the worker

Rejected for the current dashboard architecture because the dashboard needs direct synchronous query access and the first implementation should keep worker transport concerns separate from analytics state.

### Put projection logic in the React hook

Rejected because it duplicates domain logic and makes the dashboard responsible for analytics correctness.

## Consequences

The dashboard receives a simple application-level simulation API.

Runtime state is reset deterministically between runs.

UI components remain independent of worker protocol details.

Queries are executed against the same runtime that ingested simulation chunks.

The runtime factory remains injectable, allowing different commerce runtime compositions without changing the hook.

## Implementation Notes

`useSimulation` is an application-layer adapter.

`SimulationWorkerClient` remains responsible for worker lifecycle and message handling.

`SimulationGenerator` remains responsible for synthetic event generation.

`Runtime` remains responsible for event ingestion, projection state, and queries.

## Impact

Affected application:

- `apps/dashboard`

Affected flow:

```text
simulation → worker → client → controller → runtime → projections → queries → UI
```
