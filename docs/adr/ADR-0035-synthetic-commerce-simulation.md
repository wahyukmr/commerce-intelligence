# ADR-0035 — Synthetic Commerce Simulation

## Status

* **Status:** Accepted
* **Date:** 2026-09-06

## Context

V1 requires a realistic commerce event source without depending on external commerce infrastructure.

The simulation is not intended to be throwaway mock data. It must exercise the same event contracts and runtime used by future production adapters.

Large simulations also require deterministic output and chunked processing so event volume can increase without requiring all generated events to remain in memory simultaneously.

## Decision

Introduce `@ci/simulation` as the V1 synthetic commerce adapter.

The simulation:

- uses a deterministic seeded pseudo-random generator,
- generates commerce-domain events,
- uses a bounded simulation timeline,
- supports configurable user personas,
- generates events incrementally in chunks,
- validates every generated commerce event before runtime ingestion.

The simulation may depend on:

```text
@ci/commerce
@ci/runtime
```

It must not be a dependency of either package.

## Alternatives Considered

### Hard-coded fixture datasets

Rejected.

Static fixtures do not provide enough behavioral variation or scalable volume for analytics development.

### `Math.random()`

Rejected.

Non-deterministic randomness makes tests and benchmark comparisons difficult to reproduce.

### External random-data library

Rejected for the core generator.

A deterministic internal PRNG is sufficient and avoids an unnecessary dependency.

### Generate the complete dataset before runtime ingestion

Rejected.

This increases peak memory usage and does not model the streaming ingestion workflow required by the platform.

## Consequences

### Positive

- Simulation is reproducible.
- Large datasets can be processed incrementally.
- Simulation and future production adapters use the same commerce event contracts.
- Projection and query behavior can be tested against realistic event streams.

### Negative

- Simulation behavior must be maintained as event contracts evolve.
- Synthetic behavior will never perfectly represent every production merchant.

## Implementation Notes

Core components:

```text
packages/simulation/src/random/
packages/simulation/src/timeline/
packages/simulation/src/generator/
packages/simulation/src/runner/
```

`SimulationRunner` validates every generated event before calling `Runtime.ingest()`.

## Impact

Affected:

- `@ci/simulation`
- `@ci/commerce`
- runtime integration testing
- future dashboard demo data

Not affected:

- runtime contracts
- dashboard components
- production transport
