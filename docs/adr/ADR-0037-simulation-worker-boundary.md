# ADR-0037: Simulation Worker Boundary

## Status

* **Status:** Accepted
* **Date:** 2026-09-07

## Context

Large synthetic commerce simulations are CPU-intensive. Running generation on the dashboard main thread can block rendering and interaction.

The simulation package is also intended to remain reusable in non-browser environments such as Node-based benchmarks and integration tests.

## Decision

Introduce a framework-agnostic worker protocol and runner in `@ci/simulation`.

The package defines:

- start requests
- cancellation requests
- progress messages
- chunk messages
- completion messages
- cancellation messages
- error messages

The dashboard provides the browser Web Worker adapter.

Only one simulation request may be active per worker instance.

Cancellation is cooperative and occurs at chunk boundaries.

## Alternatives Considered

### Put Web Worker APIs inside `@ci/simulation`

Rejected because it couples the simulation domain package to the browser runtime.

### Generate the entire dataset before posting to the dashboard

Rejected because it defeats streaming and increases peak memory usage.

### Use multiple workers immediately

Rejected because the first requirement is to remove main-thread blocking while preserving deterministic behavior. Parallel partitioning can be introduced later after profiling demonstrates a need.

## Consequences

The dashboard can run larger simulations without performing generation on its main thread.

Node benchmarks remain independent from browser APIs.

The protocol becomes a stable boundary for future worker-based runtime ingestion.

A single worker serializes simulation requests and therefore avoids concurrent generator state.

## Implementation Notes

`SimulationWorkerRunner` is transport-independent.

`simulation.worker.ts` is the browser adapter.

Chunks remain ordinary `SimulationChunk` values and are therefore directly consumable by the existing runtime ingestion path.

## Impact

Affected packages:

- `@ci/simulation`
- dashboard application worker adapter

No changes are required to `@ci/runtime` or `@ci/commerce`.
