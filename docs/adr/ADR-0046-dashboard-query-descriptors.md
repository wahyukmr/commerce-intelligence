# ADR-0046: Dashboard Query Descriptors

## Status

* **Status:** Accepted
* **Date:** 2026-09-09

## Context

Dashboard features still need a stable way to refer to a query without repeatedly passing raw string names through feature code.

## Decision

Introduce `DashboardQueryRef<TInput, TResult>` as a small dashboard-side query descriptor.

The descriptor owns only the query name and delegates execution to `CommerceDashboardQueryService`.

It does not own runtime state, query implementations, caching, or commerce calculations.

## Alternatives Considered

### Keep raw strings everywhere

Rejected. Repeated string literals increase typo risk and make query references harder to reuse.

### Introduce a global query registry

Rejected. The existing `CommerceQueryComposition` already owns query registration; duplicating that concern in the dashboard would create two sources of truth.

### Generate query descriptors from commerce contracts

Deferred. That would require a broader code-generation or schema decision that is not necessary for the current dashboard boundary.

## Consequences

Positive:

- query identifiers become reusable values;
- input and result types can be attached at the feature boundary;
- execution still passes through the existing query service;
- runtime and commerce packages remain unchanged.

Negative:

- descriptors do not by themselves guarantee that the named query is registered;
- individual features still need to define accurate input/result types.

## Implementation Notes

`defineDashboardQueryRef()` validates the query name and returns a frozen descriptor.

The descriptor executes through `CommerceDashboardQueryService.execute()` and never accesses `Runtime` directly.

## Impact

This decision affects dashboard read-side code only. It does not modify `@ci/runtime`, `@ci/commerce`, or the simulation worker protocol.
