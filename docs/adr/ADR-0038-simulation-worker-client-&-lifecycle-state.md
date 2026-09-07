# ADR-0038: Simulation Worker Client and Lifecycle State

## Status

* **Status:** Accepted
* **Date:** 2026-09-07

## Context

Established the worker protocol and runner but left dashboard code responsible for worker lifecycle details.

Direct protocol handling in UI components would couple presentation code to transport details and make cancellation, stale-response handling, and lifecycle transitions inconsistent.

## Decision

Introduce `SimulationWorkerClient` in the dashboard application as the browser-side adapter for the simulation worker.

Introduce an explicit lifecycle state model:

- `idle`
- `running`
- `completed`
- `cancelled`
- `error`

The client owns:

- worker construction through dependency injection
- request ID generation
- request isolation
- protocol message dispatch
- progress callbacks
- chunk callbacks
- cancellation
- disposal
- lifecycle state publication

The UI does not construct worker protocol messages directly.

Generated chunks are delivered through callbacks instead of being stored in client state.

## Alternatives Considered

### Put the client in `@ci/simulation`

Rejected because Web Worker APIs are browser-specific and the simulation package must remain environment-independent.

### Handle worker messages directly inside React components

Rejected because it duplicates lifecycle and protocol handling across consumers.

### Store every generated chunk in client state

Rejected because large simulations would turn a transport adapter into an unnecessary memory owner.

## Consequences

The dashboard obtains a stable application-level API for simulation execution.

Worker protocol details remain isolated from UI components.

Large generated datasets can continue streaming without being retained by the client.

The client is testable without a real browser worker because worker creation is injected.

## Implementation Notes

`SimulationWorkerClient` lives in the dashboard application.

`SimulationWorkerRunner` and protocol contracts remain in `@ci/simulation`.

The boundary remains:

```text
Dashboard Client → Worker Protocol → Simulation Runner
```

## Impact

Affected application:

- `apps/dashboard`
