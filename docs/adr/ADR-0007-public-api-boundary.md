# ADR-0007 — Public API Boundary

* **Status:** Accepted
* **Date:** 2026-08-17

---

## Context

Allowing consumers to import implementation files tightly couples them to the internal package structure.

Refactoring internal modules becomes risky because external consumers may depend on implementation details.

---

## Decision

Domain packages expose one public entry point. Configuration packages may expose documented subpaths for separate presets or environments.

```text
src/
└── index.ts
```

Consumers must import only from the package root or a documented configuration subpath.

Example:

```ts
import { calculatePrice } from '@ci/commerce';
```

Direct imports into internal files are prohibited.

---

## Rationale

A stable public API:

* protects implementation details;
* simplifies refactoring;
* improves discoverability;
* creates a clear package contract.

---

## Consequences

### Positive

* Stable package interfaces.
* Easier internal refactoring.
* Smaller public surface.

### Negative

* Public exports require deliberate maintenance.
* Internal modules cannot be consumed directly.

---

## Alternatives Considered

### Free Internal Imports

Rejected.

Internal imports create hidden coupling and make package evolution difficult.

---

## Review

Review if package export strategy changes significantly.
