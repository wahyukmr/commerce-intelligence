# ADR-0062 — Production Adapter Composition

## Status

* **Status:** Accepted
* **Date:** 2026-09-13

## Context
The platform needs production inputs while keeping source-specific mapping outside the generic runtime.

## Decision
Compose production source adapters in the domain package or application composition root. The runtime package exposes generic source-adapter mechanics and canonical event delivery contracts. Commerce owns commerce-specific source mapping.

The first concrete composition is a commerce REST event adapter.

## Alternatives Considered

### Put all production adapters in Runtime
Rejected because Runtime would accumulate domain-specific source knowledge.

### Create a separate `adapters` package now
Rejected because the repository package set is already locked and a new package would add little value at this stage.

## Consequences
The dependency direction stays:

`runtime ← commerce`

No application or vendor code is imported into Runtime.

## Implementation Notes
Concrete providers can later wrap the REST adapter through parser/mapper functions rather than forcing another generic abstraction.

## Impact
Applies to production adapter composition.
