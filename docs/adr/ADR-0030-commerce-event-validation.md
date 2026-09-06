# ADR-0030 — Commerce Event Validation

* **Status:** Accepted
* **Date:** 2026-09-02

## Context

`@ci/runtime` intentionally remains generic and does not understand commerce-specific rules.

Commerce events nevertheless require domain invariants to ensure projections receive structurally and semantically valid input.

The same validation rules must be reusable by both the V1 simulation adapter and future production ingestion adapters.

## Decision

Introduce commerce-specific validation in `@ci/commerce`.

The package exposes:

```ts
validateCommerceEvent()
assertValidCommerceEvent()
```

Validation covers:

- event identity,
- event version,
- tenant identifier,
- timestamps,
- commerce identifiers,
- order item constraints,
- duplicate product identifiers within an order,
- currency format,
- monetary value validity,
- order subtotal consistency,
- order total consistency,
- required reasons and identifiers.

Validation occurs before a commerce event is passed to the generic runtime.

## Alternatives Considered

### Validate all commerce rules inside `@ci/runtime`

Rejected.

This would couple the generic runtime to a specific business domain.

### Validate only inside the simulation generator

Rejected.

Production adapters would then use a different validation path.

### Rely entirely on TypeScript types

Rejected.

TypeScript validates compile-time shape but cannot validate external runtime data.

### Use a schema-validation dependency immediately

Rejected for V1.

The current event model can be validated with small deterministic domain functions without introducing another runtime dependency.

A schema library may be introduced later if external contract volume or dynamic schema requirements justify it.

## Consequences

### Positive

- Runtime remains domain-agnostic.
- Simulation and future production adapters share validation semantics.
- Invalid commerce events fail before reaching projections.
- Business invariants are explicit and testable.

### Negative

- Ingestion adapters must explicitly invoke validation.
- Validation logic must evolve when event contracts evolve.


## Implementation Notes

Implementation:

```text
packages/commerce/src/validation/commerce-event-validation.ts
```

Validation is intentionally pure.

No state, storage, transport, or framework dependencies are required.

## Impact

Affected:

- `@ci/commerce`
- simulation adapter
- future production ingestion adapters
- commerce projections

Not affected:

- `@ci/runtime`
- dashboard
- query contracts
