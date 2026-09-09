# ADR-0020: Simulation Scenarios and Scale Profiles

## Status

* **Status:** Accepted
* **Date:** 2026-09-06

## Context

The initial synthetic commerce simulation provided a deterministic event generator but lacked explicit scale profiles and scenario-level behavioral controls.

The simulation also needed to represent more complete commerce lifecycle outcomes, including cancellation and refund.

A further correctness issue existed in timestamp generation: independently generated timestamps could produce lifecycle events in an invalid temporal order.

The simulation is intended to support:

- dashboard development
- integration testing
- performance testing
- deterministic reproduction
- realistic behavior exploration

## Decision

Introduce explicit simulation scenarios composed of:

- a scale profile
- a behavior profile

The initial scale profiles are:

- small: 5,000 users
- medium: 10,000 users
- large: 100,000 users

The generator preserves causal ordering between related lifecycle events.

Cancellation and refund events are generated probabilistically according to the selected behavior profile.

Progress is reported through logical counters rather than wall-clock timing.

The large profile is not executed as part of ordinary unit tests.

## Alternatives Considered

### One fixed simulation configuration

Rejected because it couples tests, demos, and benchmarks to a single dataset size.

### Separate generators for small and large datasets

Rejected because it duplicates domain behavior and allows the implementations to diverge.

### Random timestamps followed by sorting

Rejected because sorting cannot guarantee causal semantics across event relationships.

## Consequences

The simulation becomes easier to use for multiple workloads without changing generator logic.

Behavior can be changed independently from scale.

Lifecycle events become semantically valid for downstream projections.

Large datasets can be streamed using chunks instead of always materializing the entire dataset.

The same simulation behavior can still be reproduced from a deterministic seed.

## Implementation Notes

`SimulationScenario` is the composition root for scale and behavior.

`SimulationCausalClock` owns relative event timing.

`SimulationGenerator` owns user/session behavior.

`SimulationEventFactory` owns event envelope construction.

`SimulationRunner` owns runtime ingestion.

## Impact

Affected package:

- `@ci/simulation`

Primary consumers:

- dashboard development
- integration tests
- runtime benchmarking
- future worker-based simulation execution

Production adapters remain unaffected.
