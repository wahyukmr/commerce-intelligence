# ADR-0041: Commerce Query Composition

## Status

* **Status:** Accepted
* **Date:** 2026-09-08

## Context

`createCommerceRuntimeComposition()` as the canonical composition root for commerce projections while keeping query implementations injectable.

The next problem is composition consistency. Applications should not repeatedly invent their own domain grouping and query ordering when assembling the existing commerce query implementations.

At the same time, query selection must remain explicit. The commerce package should not create global query singletons or force every consumer to register every query.

## Decision

Introduce `createCommerceQueryComposition()` in `@ci/commerce`.

The function accepts already-constructed query implementations grouped by commerce domain:

- revenue
- customer
- product
- session
- funnel
- retention

It returns an immutable composition containing the domain groups, a canonical `all` list, and the domain group descriptors.

The composition does not construct query implementations. Application code remains responsible for choosing which existing query implementations to provide.

Duplicate query names are rejected during composition.

The resulting `all` collection is passed to `createCommerceRuntimeComposition()`.

## Alternatives Considered

### Construct every query inside the composition function

Rejected because it would hide query selection and force every consumer to depend on every commerce query implementation.

### Keep raw arrays everywhere

Rejected because each consumer would need to repeat the same domain grouping rules.

### Global query registry

Rejected because query instances remain runtime-bound read-side dependencies and should not become global mutable state.

## Consequences

Commerce queries have a consistent domain-oriented composition model.

Applications retain explicit control over which queries are exposed.

The runtime package remains generic and unchanged.

The composition object can be reused by dashboard controllers, tests, and future adapters.

## Implementation Notes

`createCommerceQueryComposition()` is part of the public `@ci/commerce` API.

It accepts only query implementations and performs no event processing.

`createCommerceRuntimeComposition()` remains responsible for runtime and projection composition.

## Impact

Affected package:

- `@ci/commerce`

Affected consumers:

- dashboard runtime composition
- integration tests
- future application consumers
